import { NextResponse } from "next/server";
import { revalidateAll } from "@/lib/revalidatePublic";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta, packArticleMeta } from "@/lib/articleMeta";
import { requirePermission } from "@/lib/auth";

export async function POST(_req, { params }) {
  const { errorResponse } = await requirePermission("article.publish");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const { data: cur, error: fetchErr } = await supabaseAdmin
      .from("articles")
      .select("content_en")
      .eq("id", id)
      .single();

    if (fetchErr) throw fetchErr;
    const parsed = unpackArticleMeta(cur?.content_en);
    const updatedEn = packArticleMeta({
      status: "published",
      excerptEn: parsed.excerptEn,
      meta: { ...parsed.meta, deletedAt: null },
      contentEn: parsed.cleanContentEn,
    });

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update({ content_en: updatedEn, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await revalidateAll(["/", `/story/${id}`, "/rss.xml", "/sitemap.xml"]);

    return NextResponse.json({ success: true, article: { ...data, status: "published" } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
