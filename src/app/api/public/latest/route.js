import { NextResponse } from "next/server";
import { fetchLatestTimelinePage, fetchMostReadArticles } from "@/lib/latestData";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const langParam = (searchParams.get("lang") || "ur").trim().toLowerCase();
    const lang = langParam === "en" ? "en" : "ur";
    const offset = Math.max(0, Number(searchParams.get("offset")) || 0);
    const limit = Math.min(40, Math.max(1, Number(searchParams.get("limit")) || 20));
    const includeSidebar = searchParams.get("includeSidebar") === "1";

    const [timeline, mostRead] = await Promise.all([
      fetchLatestTimelinePage({ lang, offset, limit }),
      includeSidebar ? fetchMostReadArticles({ lang, limit: 8 }) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      articles: timeline.articles,
      hasMore: timeline.hasMore,
      ...(mostRead ? { mostRead } : {}),
    });
  } catch (err) {
    console.error("public latest api error:", err);
    return NextResponse.json({ articles: [], hasMore: false }, { status: 200 });
  }
}
