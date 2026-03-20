import { defaultPassportConfig } from "@/config/passportConfig";

// Legacy layout generator (kept for backward compat, prefer layoutEngine.ts)
export async function generateLayout(passportImages: Buffer[]): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const { width_mm, height_mm, dpi, gridRows, gridCols } = defaultPassportConfig;
  
  const a4WidthPx = Math.round((210 / 25.4) * dpi);
  const a4HeightPx = Math.round((297 / 25.4) * dpi);
  
  const passportWidthPx = Math.round((width_mm / 25.4) * dpi);
  const passportHeightPx = Math.round((height_mm / 25.4) * dpi);
  
  const canvas = sharp({
    create: {
      width: a4WidthPx,
      height: a4HeightPx,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  });
  
  const spacingX = Math.round((5 / 25.4) * dpi);
  const spacingY = Math.round((5 / 25.4) * dpi);
  
  const totalGridWidthPx = (gridCols * passportWidthPx) + ((gridCols - 1) * spacingX);
  const totalGridHeightPx = (gridRows * passportHeightPx) + ((gridRows - 1) * spacingY);
  
  const startX = Math.round((a4WidthPx - totalGridWidthPx) / 2);
  const startY = Math.round((a4HeightPx - totalGridHeightPx) / 2);
  
  const composites: { input: Buffer; top: number; left: number }[] = [];
  
  let imgIndex = 0;
  for (let row = 0; row < gridRows; row++) {
    for (let col = 0; col < gridCols; col++) {
      if (imgIndex < passportImages.length) {
        composites.push({
          input: passportImages[imgIndex],
          top: startY + (row * (passportHeightPx + spacingY)),
          left: startX + (col * (passportWidthPx + spacingX))
        });
        imgIndex++;
      }
    }
  }
  
  return await canvas.composite(composites).jpeg({ quality: 90 }).toBuffer();
}
