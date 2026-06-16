// Server-side layout generation parameters
interface GenerateLayoutProps {
  images: Buffer[];
  quantity: number;
  photoWidthMm: number;
  photoHeightMm: number;
  gapMm: number;
  marginMm: number;
}

// Result metadata returned alongside the buffer
export interface LayoutResult {
  buffer: Buffer;
  maxFit: number;   // Max photos that physically fit on the sheet
  actualCount: number; // Photos actually placed
  cols: number;
  rows: number;
}

export async function generateLayout({ 
  images, 
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm
}: GenerateLayoutProps): Promise<LayoutResult> {
  // Dynamic import — prevents Turbopack from bundling sharp's native binary
  const sharp = (await import("sharp")).default;
  const dpi = 300;
  
  // High-precision physical mm to pixel conversion
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const a4WidthMm = 210;
  const a4HeightMm = 297;

  // Print-grade A4 size (210mm x 297mm)
  const a4WidthPx = mmToPx(a4WidthMm);
  const a4HeightPx = mmToPx(a4HeightMm);

  // Physical grid boundaries in mm to match client calculations exactly and avoid rounding drift
  const printableWMm = a4WidthMm - 2 * marginMm;
  const printableHMm = a4HeightMm - 2 * marginMm;

  if (photoWidthMm <= 0 || photoHeightMm <= 0 || printableWMm <= 0 || printableHMm <= 0) {
    throw new Error("Invalid dimensions: photo or margin too large for A4 sheet");
  }

  // Maximum items fitting horizontally and vertically computed in mm
  const totalCols = Math.max(1, Math.floor((printableWMm + gapMm) / (photoWidthMm + gapMm)));
  const totalRows = Math.max(1, Math.floor((printableHMm + gapMm) / (photoHeightMm + gapMm)));
  const maxFit = totalCols * totalRows;

  // Clamp requested quantity to what actually fits
  const actualCount = Math.min(quantity, maxFit);

  // Create blank white A4 canvas
  const canvas = sharp({
    create: {
      width: a4WidthPx,
      height: a4HeightPx,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  // Target sizes in pixels for scaling the photo
  const photoWidthPx = mmToPx(photoWidthMm);
  const photoHeightPx = mmToPx(photoHeightMm);

  // Resize source image once to exact target pixel dimensions
  const resizedImage = images.length > 0
    ? await sharp(images[0]).resize(photoWidthPx, photoHeightPx, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer()
    : Buffer.alloc(0);

  // Overlay options for compositing all photos + cutting guides
  const composites: { input: Buffer; top: number; left: number }[] = [];

  for (let i = 0; i < actualCount; i++) {
    const col = i % totalCols;
    const row = Math.floor(i / totalCols);

    // Compute exact physical coordinates in mm first
    const leftMm = marginMm + col * (photoWidthMm + gapMm);
    const topMm = marginMm + row * (photoHeightMm + gapMm);

    // Convert individual placement coordinates to pixel offsets
    const left = mmToPx(leftMm);
    const top = mmToPx(topMm);

    // Dashed cutting guide SVG - offset rect by 1px to prevent 2px stroke clipping
    const borderSvg = Buffer.from(
      `<svg width="${photoWidthPx}" height="${photoHeightPx}"><rect x="1" y="1" width="${photoWidthPx - 2}" height="${photoHeightPx - 2}" fill="none" stroke="#cccccc" stroke-width="2" stroke-dasharray="12,6" /></svg>`
    );

    composites.push({ input: resizedImage, top, left });
    composites.push({ input: borderSvg, top, left });
  }

  // compressionLevel 0 = fastest/largest = maximum quality PNG
  const buffer = await canvas.composite(composites).png({ compressionLevel: 0 }).toBuffer();

  return { buffer, maxFit, actualCount, cols: totalCols, rows: totalRows };
}
