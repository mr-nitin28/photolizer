// Server-side layout generation parameters
export interface GenerateLayoutProps {
  images: Buffer[];
  quantity: number;
  photoWidthMm: number;
  photoHeightMm: number;
  gapMm: number;
  marginMm: number;
  paperWidthMm?: number;
  paperHeightMm?: number;
  backgroundColorHex?: string;
}

// Result metadata returned alongside the buffer
export interface LayoutResult {
  buffer: Buffer;
  maxFit: number;   // Max photos that physically fit on the sheet
  actualCount: number; // Photos actually placed
  cols: number;
  rows: number;
  paperWidthMm: number;
  paperHeightMm: number;
}

export async function generateLayout({ 
  images, 
  quantity,
  photoWidthMm,
  photoHeightMm,
  gapMm,
  marginMm,
  paperWidthMm = 210,
  paperHeightMm = 297,
  backgroundColorHex = "#ffffff",
}: GenerateLayoutProps): Promise<LayoutResult> {
  // Dynamic import — prevents Turbopack from bundling sharp's native binary
  const sharp = (await import("sharp")).default;
  const dpi = 300;
  
  // High-precision physical mm to pixel conversion
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  // Print-grade sheet dimensions
  const sheetWidthPx = mmToPx(paperWidthMm);
  const sheetHeightPx = mmToPx(paperHeightMm);

  // Physical grid boundaries in mm
  const printableWMm = paperWidthMm - 2 * marginMm;
  const printableHMm = paperHeightMm - 2 * marginMm;

  if (photoWidthMm <= 0 || photoHeightMm <= 0 || printableWMm <= 0 || printableHMm <= 0) {
    throw new Error("Invalid dimensions: photo or margin too large for selected paper sheet");
  }

  // Maximum items fitting horizontally and vertically computed in mm
  const totalCols = Math.max(1, Math.floor((printableWMm + gapMm) / (photoWidthMm + gapMm)));
  const totalRows = Math.max(1, Math.floor((printableHMm + gapMm) / (photoHeightMm + gapMm)));
  const maxFit = totalCols * totalRows;

  // Clamp requested quantity to what actually fits
  const actualCount = Math.min(quantity, maxFit);

  // Parse background color for passport photo backing
  let bgR = 255, bgG = 255, bgB = 255, bgAlpha = 1;
  const isTransparent = backgroundColorHex.toLowerCase() === "transparent";
  if (!isTransparent) {
    const cleanHex = backgroundColorHex.replace("#", "");
    if (cleanHex.length === 6) {
      bgR = parseInt(cleanHex.substring(0, 2), 16);
      bgG = parseInt(cleanHex.substring(2, 4), 16);
      bgB = parseInt(cleanHex.substring(4, 6), 16);
    }
  } else {
    bgAlpha = 0;
  }

  // Create blank white sheet canvas
  const sheetCanvas = sharp({
    create: {
      width: sheetWidthPx,
      height: sheetHeightPx,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });

  // Target sizes in pixels for scaling the individual photo
  const photoWidthPx = mmToPx(photoWidthMm);
  const photoHeightPx = mmToPx(photoHeightMm);

  let singlePhotoBuffer: Buffer;
  if (images.length > 0 && images[0].length > 0) {
    // 1. Create a passport background card
    const cardBase = sharp({
      create: {
        width: photoWidthPx,
        height: photoHeightPx,
        channels: 4,
        background: { r: bgR, g: bgG, b: bgB, alpha: bgAlpha }
      }
    });

    // 2. Resize source photo to fit within passport card bounds
    const resizedCutout = await sharp(images[0])
      .resize(photoWidthPx, photoHeightPx, { 
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // 3. Composite cutout onto the background card
    singlePhotoBuffer = await cardBase
      .composite([{ input: resizedCutout, top: 0, left: 0 }])
      .png()
      .toBuffer();
  } else {
    singlePhotoBuffer = Buffer.alloc(0);
  }

  // Overlay options for compositing all photos + cutting guides
  const composites: { input: Buffer; top: number; left: number }[] = [];

  for (let i = 0; i < actualCount; i++) {
    const col = i % totalCols;
    const row = Math.floor(i / totalCols);

    // Compute exact physical coordinates in mm
    const leftMm = marginMm + col * (photoWidthMm + gapMm);
    const topMm = marginMm + row * (photoHeightMm + gapMm);

    // Convert individual placement coordinates to pixel offsets
    const left = mmToPx(leftMm);
    const top = mmToPx(topMm);

    // Dashed cutting guide SVG
    const borderSvg = Buffer.from(
      `<svg width="${photoWidthPx}" height="${photoHeightPx}"><rect x="1" y="1" width="${photoWidthPx - 2}" height="${photoHeightPx - 2}" fill="none" stroke="#cccccc" stroke-width="2" stroke-dasharray="12,6" /></svg>`
    );

    if (singlePhotoBuffer.length > 0) {
      composites.push({ input: singlePhotoBuffer, top, left });
    }
    composites.push({ input: borderSvg, top, left });
  }

  // Maximum quality output PNG
  const buffer = await sheetCanvas.composite(composites).png({ compressionLevel: 0 }).toBuffer();

  return { 
    buffer, 
    maxFit, 
    actualCount, 
    cols: totalCols, 
    rows: totalRows,
    paperWidthMm,
    paperHeightMm
  };
}
