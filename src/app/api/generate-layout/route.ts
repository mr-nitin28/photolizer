import { NextResponse } from "next/server";
import { generateLayout } from "@/lib/layout/layoutEngine";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      imageBase64, 
      quantity = 1,
      photoWidthMm = 35,
      photoHeightMm = 45,
      gapMm = 4,
      marginMm = 5 
    } = body;
    
    if (!imageBase64) {
      return NextResponse.json({ error: "No imageBase64 provided" }, { status: 400 });
    }

    // Decode base64 image to raw buffer
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");

    // Generate layout — engine handles resizing internally now
    const result = await generateLayout({
      images: [imageBuffer],
      quantity: Number(quantity),
      photoWidthMm: Number(photoWidthMm),
      photoHeightMm: Number(photoHeightMm),
      gapMm: Number(gapMm),
      marginMm: Number(marginMm),
    });

    const outputBase64 = `data:image/png;base64,${result.buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      layoutBase64: outputBase64,
      maxFit: result.maxFit,
      actualCount: result.actualCount,
      cols: result.cols,
      rows: result.rows,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("Generate Layout error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

