import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { Inter, Noto_Naskh_Arabic } from "next/font/google";
import { SiteLanguageProvider } from "@/context/SiteLanguageContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-naskh",
});

export const metadata = {
  title: {
    default: "ڈیلی افادیت — سچ کے ساتھ، ہر خبر",
    template: "%s — ڈیلی افادیت",
  },
  description: "ڈیلی افادیت نیوز پورٹل: پاکستان، دنیا، کھیل اور بزنس کی تازہ ترین اور مصدقہ خبریں | Daily Afadiat News",
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
    <html lang="ur" dir="rtl" translate="no" className={`notranslate ${notoNaskh.variable} ${inter.variable}`}>
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
        <SiteLanguageProvider>
          <div className="min-h-screen flex flex-col">
            {children}
          </div>
        </SiteLanguageProvider>
      </body>
    </html>
  );
}
