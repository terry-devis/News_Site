import { resolvePublicSiteUrl } from "@/lib/seoUrl";

export default function robots() {
  if (process.env.NEXT_PUBLIC_APP_ROLE === "admin") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const baseUrl = resolvePublicSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: [`${baseUrl}/sitemap.xml`, `${baseUrl}/news-sitemap.xml`],
  };
}
