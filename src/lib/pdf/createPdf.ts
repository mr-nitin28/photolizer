import { PDFDocument } from "pdf-lib";

export async function createPdf(layoutImageBuffer: Buffer, isA4: boolean = true): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  
  // Need to detect if it's png or jpg
  let image;
  try {
    image = await pdfDoc.embedPng(layoutImageBuffer);
  } catch (e) {
    image = await pdfDoc.embedJpg(layoutImageBuffer);
  }

  const { width, height } = image.scale(1);
  
  if (isA4) {
    // A4 size in points -> 595.28 x 841.89
    const page = pdfDoc.addPage([595.28, 841.89]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: 595.28,
      height: 841.89,
    });
  } else {
    // Custom size matching the embedded image perfectly
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: width,
      height: height,
    });
  }
  
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
