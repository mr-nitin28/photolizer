import { PDFDocument } from "pdf-lib";

interface CreatePdfOptions {
  paperWidthMm?: number;
  paperHeightMm?: number;
  isA4?: boolean;
}

export async function createPdf(
  layoutImageBuffer: Buffer, 
  options: CreatePdfOptions | boolean = true
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Need to detect if it's png or jpg
  let image;
  try {
    image = await pdfDoc.embedPng(layoutImageBuffer);
  } catch {
    image = await pdfDoc.embedJpg(layoutImageBuffer);
  }

  // 1 mm = 72 / 25.4 points ≈ 2.83464567 points
  const mmToPt = (mm: number) => mm * (72 / 25.4);

  let pageWidthPt: number;
  let pageHeightPt: number;

  if (typeof options === "boolean") {
    if (options) {
      // Default A4 in points
      pageWidthPt = 595.28;
      pageHeightPt = 841.89;
    } else {
      const { width, height } = image.scale(1);
      pageWidthPt = width;
      pageHeightPt = height;
    }
  } else {
    const { paperWidthMm = 210, paperHeightMm = 297 } = options;
    pageWidthPt = mmToPt(paperWidthMm);
    pageHeightPt = mmToPt(paperHeightMm);
  }

  const page = pdfDoc.addPage([pageWidthPt, pageHeightPt]);
  page.drawImage(image, {
    x: 0,
    y: 0,
    width: pageWidthPt,
    height: pageHeightPt,
  });
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
