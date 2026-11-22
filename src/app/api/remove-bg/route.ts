import { NextResponse } from "next/server";
import { removeBackground } from "@/lib/image/removeBackground";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File exceeds 5MB limit" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const processedBuffer = await removeBackground(buffer, file.type);
    const base64Image = `data:image/png;base64,${processedBuffer.toString("base64")}`;
    
    return NextResponse.json({ success: true, image: base64Image });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("Remove BG error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
