import { NextResponse } from "next/server";
import { generateLayout } from "@/lib/layout/layoutEngine";
import { createPdf } from "@/lib/pdf/createPdf";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      layoutBase64, 
      isA4 = true,
      
      // Layout parameters for direct rendering
      imageBase64,
      quantity,
      photoWidthMm,
      photoHeightMm,
      gapMm,
      marginMm,
    } = body;
    
    let layoutBuffer: Buffer;

    if (imageBase64) {
      // Decode source image base64
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      const imageBuffer = Buffer.from(base64Data, "base64");

      // Generate layout on-the-fly
      const result = await generateLayout({
        images: [imageBuffer],
        quantity: Number(quantity),
        photoWidthMm: Number(photoWidthMm),
        photoHeightMm: Number(photoHeightMm),
        gapMm: Number(gapMm),
        marginMm: Number(marginMm),
      });
      layoutBuffer = result.buffer;
    } else if (layoutBase64) {
      // Direct layout base64 conversion (legacy)
      const base64Data = layoutBase64.replace(/^data:image\/\w+;base64,/, "");
      layoutBuffer = Buffer.from(base64Data, "base64");
    } else {
      return NextResponse.json({ error: "No imageBase64 or layoutBase64 provided" }, { status: 400 });
    }

    const pdfBuffer = await createPdf(layoutBuffer, isA4);
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    console.error("Export PDF error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
