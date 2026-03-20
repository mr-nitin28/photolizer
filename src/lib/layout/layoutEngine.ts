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

  // Print-grade A4 size (210mm x 297mm)
  const a4WidthPx = mmToPx(210);
  const a4HeightPx = mmToPx(297);

  const photoWidth = mmToPx(photoWidthMm);
  const photoHeight = mmToPx(photoHeightMm);
  const gap = mmToPx(gapMm);
  const margin = mmToPx(marginMm);

  // Guard: if a single photo is larger than printable area
  const printableW = a4WidthPx - 2 * margin;
  const printableH = a4HeightPx - 2 * margin;

  if (photoWidth <= 0 || photoHeight <= 0 || printableW <= 0 || printableH <= 0) {
    throw new Error("Invalid dimensions: photo or margin too large for A4 sheet");
  }

  // Maximum items fitting horizontally and vertically
  const totalCols = Math.max(1, Math.floor((printableW + gap) / (photoWidth + gap)));
  const totalRows = Math.max(1, Math.floor((printableH + gap) / (photoHeight + gap)));
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

  // Overlay options for compositing all photos + cutting guides
  const composites: { input: Buffer; top: number; left: number }[] = [];

  // Resize source image once to exact target pixel dimensions
  const resizedImage = images.length > 0
    ? await sharp(images[0]).resize(photoWidth, photoHeight, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } }).png().toBuffer()
    : Buffer.alloc(0);

  for (let i = 0; i < actualCount; i++) {
    const col = i % totalCols;
    const row = Math.floor(i / totalCols);

    const left = margin + col * (photoWidth + gap);
    const top = margin + row * (photoHeight + gap);

    // Dashed cutting guide SVG
    const borderSvg = Buffer.from(
      `<svg width="${photoWidth}" height="${photoHeight}"><rect x="0" y="0" width="${photoWidth}" height="${photoHeight}" fill="none" stroke="#cccccc" stroke-width="2" stroke-dasharray="12,6" /></svg>`
    );

    composites.push({ input: resizedImage, top, left });
    composites.push({ input: borderSvg, top, left });
  }

  // compressionLevel 0 = fastest/largest = maximum quality PNG
  const buffer = await canvas.composite(composites).png({ compressionLevel: 0 }).toBuffer();

  return { buffer, maxFit, actualCount, cols: totalCols, rows: totalRows };
}
