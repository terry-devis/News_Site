import { NextResponse } from "next/server";
import { getSiteSetting, updateSiteSetting } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key) {
      const val = await getSiteSetting(key);
      if (key === "smtp_config" && val) {
        return NextResponse.json({ [key]: { ...val, pass: val.pass ? "••••••••" : "" } });
      }
      return NextResponse.json({ [key]: val });
    }

    const isPublicOnly = searchParams.get("public") === "1";
    if (isPublicOnly) {
      const [social_links, site_info, breaking_ticker_enabled] = await Promise.all([
        getSiteSetting("social_links"),
        getSiteSetting("site_info"),
        getSiteSetting("breaking_ticker_enabled"),
      ]);
      return NextResponse.json({
        social_links,
        site_info,
        breaking_ticker_enabled: breaking_ticker_enabled !== false,
      });
    }

    const [social_links, site_info, rawSmtp] = await Promise.all([
      getSiteSetting("social_links"),
      getSiteSetting("site_info"),
      getSiteSetting("smtp_config"),
    ]);
    const smtp_config = rawSmtp ? { ...rawSmtp, pass: rawSmtp.pass ? "••••••••" : "" } : null;

    return NextResponse.json({ social_links, site_info, smtp_config });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("settings.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    // Preserve existing SMTP password if blank or masked
    let finalValue = value;
    if (key === "smtp_config" && typeof value === "object" && value !== null) {
      if (!value.pass || value.pass === "••••••••") {
        const existing = await getSiteSetting("smtp_config");
        finalValue = { ...value, pass: existing?.pass || "" };
      }
    }

    const updated = await updateSiteSetting(key, finalValue);
    return NextResponse.json({ success: true, [key]: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
