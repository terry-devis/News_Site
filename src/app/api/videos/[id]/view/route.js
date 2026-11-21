import { NextResponse } from "next/server";
import { incrementVideoViews } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
    }

    const nextViews = await incrementVideoViews(id);
    if (nextViews === null) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, views_count: nextViews });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
