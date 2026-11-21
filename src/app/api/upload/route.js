import { NextResponse } from "next/server";
import { uploadMedia, uploadMediaChunk, completeMediaChunks } from "@/lib/r2";
import { requirePermission } from "@/lib/auth";

export async function POST(req) {
  const { errorResponse } = await requirePermission("media.upload");
  if (errorResponse) return errorResponse;

  try {
    const formData = await req.formData();
    const action = formData.get("action");

    if (action === "chunk") {
      const uploadId = formData.get("uploadId");
      const partIndex = formData.get("partIndex");
      const file = formData.get("file");
      if (!file || typeof file === "string") {
        return NextResponse.json({ error: "No chunk provided" }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const res = await uploadMediaChunk(buffer, uploadId, partIndex);
      return NextResponse.json(res);
    }

    if (action === "complete") {
      const uploadId = formData.get("uploadId");
      const totalParts = formData.get("totalParts");
      const filename = formData.get("filename") || "edition.pdf";
      const contentType = formData.get("contentType") || "application/pdf";
      const result = await completeMediaChunks(uploadId, totalParts, filename, contentType);
      return NextResponse.json(result);
    }

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
