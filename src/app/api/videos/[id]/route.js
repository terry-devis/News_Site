import { NextResponse } from "next/server";
import { getVideoById, saveVideo, deleteVideo } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const video = await getVideoById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    return NextResponse.json({ video });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await saveVideo({ ...body, id });
    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
