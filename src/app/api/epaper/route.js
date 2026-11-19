import { NextResponse } from "next/server";
import { getEpaperEditions, saveEpaperEdition } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const city = searchParams.get("city");
    const editions = await getEpaperEditions(date, city);
    return NextResponse.json({ editions });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.edition_date || !body.city_slug) {
      return NextResponse.json(
        { error: "ایڈیشن کی تاریخ اور شہر کا انتخاب لازمی ہے (Date and City are required)" },
        { status: 400 }
      );
    }
    const edition = await saveEpaperEdition(body);
    return NextResponse.json({ success: true, edition });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
