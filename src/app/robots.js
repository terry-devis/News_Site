export default function robots() {
  if (process.env.NEXT_PUBLIC_APP_ROLE === "admin") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyafadiat.com";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
