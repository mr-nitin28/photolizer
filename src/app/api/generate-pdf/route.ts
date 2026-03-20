import { NextResponse } from "next/server";
import { generateLayout } from "@/lib/layout/layoutEngine";
import { createPdf } from "@/lib/pdf/createPdf";

// Legacy endpoint: generates a default 2x2 passport grid PDF
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageBase64 } = body;
    
    if (!imageBase64) {
      return NextResponse.json({ error: "No imageBase64 provided" }, { status: 400 });
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Use the unified layout engine with default passport settings
    const result = await generateLayout({
      images: [imageBuffer],
      quantity: 4,
      photoWidthMm: 35,
      photoHeightMm: 45,
      gapMm: 4,
      marginMm: 5,
    });

    const pdfBuffer = await createPdf(result.buffer);
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    console.error("Generate PDF error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
