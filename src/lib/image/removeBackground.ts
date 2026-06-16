export async function removeBackground(imageBuffer: Buffer, mimetype: string): Promise<Buffer> {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey || apiKey === "your_api_key_here") {
    throw new Error("Missing REMOVE_BG_API_KEY. Please set your real Remove.bg API key in the .env.local file.");
  }

  const formData = new FormData();
  
  const blob = new Blob(
    [new Uint8Array(imageBuffer.buffer as ArrayBuffer, imageBuffer.byteOffset, imageBuffer.byteLength)],
    { type: mimetype }
  );
  formData.append("image_file", blob, "image.jpg");
  formData.append("size", "auto");

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Remove.bg API failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
