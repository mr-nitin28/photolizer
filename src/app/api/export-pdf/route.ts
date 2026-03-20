import { NextResponse } from "next/server";
import { createPdf } from "@/lib/pdf/createPdf";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { layoutBase64, isA4 = true } = body;
    
    if (!layoutBase64) {
      return NextResponse.json({ error: "No layoutBase64 provided" }, { status: 400 });
    }

    const base64Data = layoutBase64.replace(/^data:image\/\w+;base64,/, "");
    const layoutBuffer = Buffer.from(base64Data, "base64");

    const pdfBuffer = await createPdf(layoutBuffer, isA4);
    const pdfBase64 = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    return NextResponse.json({ success: true, pdfBase64 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to generate PDF";
    console.error("Export PDF error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
