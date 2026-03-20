import { defaultPassportConfig } from "@/config/passportConfig";

// Resize image to passport dimensions for print output
export async function resizePassport(
  imageBuffer: Buffer, 
  customWidthMm?: number, 
  customHeightMm?: number
): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  const { dpi } = defaultPassportConfig;
  
  const widthMm = customWidthMm || defaultPassportConfig.width_mm;
  const heightMm = customHeightMm || defaultPassportConfig.height_mm;

  const pxWidth = Math.round((widthMm / 25.4) * dpi);
  const pxHeight = Math.round((heightMm / 25.4) * dpi);
  
  return await sharp(imageBuffer)
    .resize(pxWidth, pxHeight, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();
}
