import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { filterPublishedArticles } from "@/lib/articleMeta";
import {
  loadStoryPageData,
  buildStoryMetadata,
  buildNewsArticleJsonLd,
} from "@/lib/storySeo";
import StoryClient from "@/component/StoryClient";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  return buildStoryMetadata(params.id, "ur");
}

export default async function StoryDetail({ params }) {
  const storyIdOrSlug = params.id;
  let { article, related, categories, breakingNews, isHiddenDraft } =
    await loadStoryPageData(storyIdOrSlug);

  if (isHiddenDraft) {
    notFound();
  }

  if (!article) {
    notFound();
  }

  if (related.length === 0) {
    try {
      const { data: latestArts } = await supabase
        .from("articles")
        .select("*")
        .neq("id", article.id)
        .order("created_at", { ascending: false })
        .limit(8);
      if (latestArts) {
        related = filterPublishedArticles(latestArts).slice(0, 4);
      }
    } catch {}
  }

  const jsonLd = buildNewsArticleJsonLd(article, "ur");

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <StoryClient
        article={article}
        related={related}
        categories={categories}
        breakingNews={breakingNews}
        initialLang="ur"
      />
    </>
  );
}
