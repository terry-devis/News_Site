import { loadLatestPageData } from "@/lib/latestData";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";
import LatestClient from "@/component/LatestClient";

export const revalidate = 60;

export async function generateMetadata() {
  const baseUrl = resolvePublicSiteUrl();
  return {
    title: "Latest News — Daily Afadiat",
    description:
      "Latest verified news from Pakistan and around the world on Daily Afadiat, updated minute by minute.",
    alternates: {
      canonical: `${baseUrl}/en/latest`,
      languages: {
        ur: `${baseUrl}/latest`,
        en: `${baseUrl}/en/latest`,
        "x-default": `${baseUrl}/latest`,
      },
    },
    openGraph: {
      type: "website",
      url: `${baseUrl}/en/latest`,
      title: "Latest News — Daily Afadiat",
      description:
        "Latest verified news from Pakistan and around the world on Daily Afadiat.",
      locale: "en_US",
      siteName: "Daily Afadiat",
    },
  };
}

export default async function EnglishLatestPage() {
  const data = await loadLatestPageData({ lang: "en", limit: 20 });

  return (
    <LatestClient
      initialArticles={data.articles}
      initialHasMore={data.hasMore}
      initialMostRead={data.mostRead}
      categories={data.categories}
      breakingNews={data.breakingNews}
      socialLinks={data.socialLinks}
      breakingTickerEnabled={data.breakingTickerEnabled}
      initialLang="en"
      initialLoadedLang="en"
    />
  );
}
