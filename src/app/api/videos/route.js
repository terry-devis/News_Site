import { NextResponse } from "next/server";
import { getVideos, saveVideo } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const videos = await getVideos(category);
    return NextResponse.json({ videos });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("video.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    if (!body.title_ur) {
      return NextResponse.json({ error: "اردو عنوان لازمی ہے (Urdu title is required)" }, { status: 400 });
    }
    const video = await saveVideo(body);
    return NextResponse.json({ success: true, video });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
