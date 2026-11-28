import { loadLatestPageData } from "@/lib/latestData";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";
import LatestClient from "@/component/LatestClient";

export const revalidate = 60;

export async function generateMetadata() {
  const baseUrl = resolvePublicSiteUrl();
  return {
    title: "تازہ ترین خبریں",
    description: "ڈیلی افادیت پر پاکستان اور دنیا بھر کی تازہ ترین خبریں، لمحہ بہ لمحہ۔",
    alternates: {
      canonical: `${baseUrl}/latest`,
      languages: {
        ur: `${baseUrl}/latest`,
        en: `${baseUrl}/en/latest`,
        "x-default": `${baseUrl}/latest`,
      },
    },
    openGraph: {
      type: "website",
      url: `${baseUrl}/latest`,
      title: "تازہ ترین خبریں — ڈیلی افادیت",
      description: "ڈیلی افادیت پر پاکستان اور دنیا بھر کی تازہ ترین خبریں، لمحہ بہ لمحہ۔",
      locale: "ur_PK",
      siteName: "ڈیلی افادیت",
    },
  };
}

export default async function LatestPage() {
  const data = await loadLatestPageData({ lang: "ur", limit: 20 });

  return (
    <LatestClient
      initialArticles={data.articles}
      initialHasMore={data.hasMore}
      initialMostRead={data.mostRead}
      categories={data.categories}
      breakingNews={data.breakingNews}
      socialLinks={data.socialLinks}
      breakingTickerEnabled={data.breakingTickerEnabled}
      initialLoadedLang="ur"
    />
  );
}
