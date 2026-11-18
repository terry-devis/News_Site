import { NextResponse } from "next/server";
import { uploadMedia } from "@/lib/r2";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadMedia(buffer, file.name, file.type || "image/jpeg");

    return NextResponse.json(result);
  } catch (error) {
    console.error("API Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
