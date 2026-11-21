import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { SiteLanguageProvider } from "@/context/SiteLanguageContext";
import GlobalAdOverlay from "@/component/GlobalAdOverlay";

const isAdminApp = process.env.NEXT_PUBLIC_APP_ROLE === "admin";

export const metadata = {
  title: isAdminApp
    ? {
        default: "Daily Afadiat — Newsroom Admin",
        template: "%s — Daily Afadiat Admin",
      }
    : {
        default: "ڈیلی افادیت — سچ کے ساتھ، ہر خبر",
        template: "%s — ڈیلی افادیت",
      },
  description: isAdminApp
    ? "Daily Afadiat Newsroom CMS & Editorial Administration Panel"
    : "ڈیلی افادیت نیوز پورٹل: پاکستان، دنیا، کھیل اور بزنس کی تازہ ترین اور مصدقہ خبریں | Daily Afadiat News",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ur" dir="rtl" translate="no" className="notranslate" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="ڈیلی افادیت RSS Feed"
          href="/rss.xml"
        />
      </head>
      <body className="antialiased">
        <NextTopLoader
          color="#16a34a"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={1000}
        />
        <SiteLanguageProvider initialLang="ur">
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
          <GlobalAdOverlay />
        </SiteLanguageProvider>
      </body>
    </html>
  );
}
