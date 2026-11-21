import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSiteSetting } from "@/lib/cmsDb";
import { isArticlePubliclyPublished } from "@/lib/articleMeta";

export async function getMaxFeaturedLimit() {
  try {
    const siteInfo = await getSiteSetting("site_info");
    const parsed = Number(siteInfo?.max_featured_posts);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 50) {
      return Math.floor(parsed);
    }
  } catch {}
  return 5;
}

/**
 * Ensures no more than `max_featured_posts` published articles remain featured.
 * Keeps `keepArticleId` plus the newest (maxLimit - 1) featured articles,
 * demoting any older featured articles back to `is_featured: false`.
 */
export async function enforceMaxFeaturedLimit(keepArticleId = null) {
  try {
    const maxLimit = await getMaxFeaturedLimit();
    const { data: featuredRows, error } = await supabaseAdmin
      .from("articles")
      .select("id, content_en, created_at, updated_at")
      .eq("is_featured", true)
      .order("created_at", { ascending: false });

    if (error || !Array.isArray(featuredRows)) return;

    // Only count published featured articles toward the public featured cap
    const publishedFeatured = featuredRows.filter(
      (row) =>
        String(row.id) === String(keepArticleId) ||
        isArticlePubliclyPublished(row).published
    );

    const others = publishedFeatured.filter(
      (row) => String(row.id) !== String(keepArticleId)
    );
    const keepOtherCount = keepArticleId ? Math.max(0, maxLimit - 1) : maxLimit;
    const toDemote = others.slice(keepOtherCount).map((r) => r.id);

    if (toDemote.length > 0) {
      await supabaseAdmin
        .from("articles")
        .update({ is_featured: false })
        .in("id", toDemote);
    }
  } catch (err) {
    console.error("enforceMaxFeaturedLimit error:", err);
  }
}
