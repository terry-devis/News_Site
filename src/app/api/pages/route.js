import { NextResponse } from "next/server";
import { getPages, savePage } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const pages = await getPages();
    return NextResponse.json({ pages });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.title_ur || !body.slug) {
      return NextResponse.json(
        { error: "صفحے کا عنوان اور URL س slug لازمی ہیں (Title and slug are required)" },
        { status: 400 }
      );
    }
    const page = await savePage(body);
    return NextResponse.json({ success: true, page });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
