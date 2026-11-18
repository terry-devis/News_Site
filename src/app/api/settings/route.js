import { NextResponse } from "next/server";
import { getSiteSetting, updateSiteSetting } from "@/lib/cmsDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const val = await getSiteSetting(key);
      return NextResponse.json({ [key]: val });
    }

    const social_links = await getSiteSetting("social_links");
    const site_info = await getSiteSetting("site_info");
    const smtp_config = await getSiteSetting("smtp_config");

    return NextResponse.json({ social_links, site_info, smtp_config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    const updated = await updateSiteSetting(key, value);
    return NextResponse.json({ success: true, [key]: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
