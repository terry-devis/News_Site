import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { SiteLanguageProvider } from "@/context/SiteLanguageContext";

export const metadata = {
  title: "ڈیلی افادیت — سچ کے ساتھ، ہر خبر",
  description: "ڈیلی افادیت نیوز پورٹل: پاکستان، دنیا، کھیل اور بزنس کی تازہ ترین اور مصدقہ خبریں | Daily Afadiat News",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ur" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
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
