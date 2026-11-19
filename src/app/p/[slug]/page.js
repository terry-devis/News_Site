import React from "react";
import { notFound } from "next/navigation";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { supabase } from "@/lib/supabase";
import { getPageBySlug, getPages } from "@/lib/cmsDb";
import Link from "next/link";
import { FileText, Calendar, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "صفحہ نہیں ملا | Daily Afadiat" };

  return {
    title: `${page.title_ur || page.title_en} — ڈیلی افادیت`,
    description: page.summary_ur || page.summary_en || "ڈیلی افادیت نیوز نیٹ ورک کا آفیشل صفحہ۔",
  };
}

export default async function CMSPage({ params }) {
  const { slug } = params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  let categories = [];
  let breakingNews = [];
  try {
    const [catRes, breakRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
    ]);
    if (catRes.data) categories = catRes.data;
    if (breakRes.data) breakingNews = breakRes.data;
  } catch (e) {}

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir="rtl">
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-sans border-b border-[#dcd8cd] pb-3">
          <Link href="/" className="hover:text-emerald-700 transition">صفحۂ اول</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{page.title_ur}</span>
        </nav>

        {/* Page Container */}
        <article className="bg-white border border-[#dcd8cd] rounded-none shadow-xs p-6 sm:p-10 space-y-6">
          
          {/* Header */}
          <div className="border-b border-[#eceae3] pb-6 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <FileText size={15} />
              <span>ڈیلی افادیت آفیشل دستاویز</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold urdu-headline text-gray-950 leading-snug">
              {page.title_ur}
            </h1>

            {page.title_en && (
              <p className="text-sm font-sans font-medium text-gray-500">
                {page.title_en}
              </p>
            )}

            {page.updated_at && (
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-sans pt-1">
                <Calendar size={13} />
                <span>آخری تجدید: {new Date(page.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            )}
          </div>

          {/* Lead Summary Callout (if available) */}
          {page.summary_ur && (
            <div className="p-4 bg-[#f7f6f3] border-r-4 border-emerald-700 rounded-none text-sm text-gray-800 font-medium leading-relaxed">
              {page.summary_ur}
            </div>
          )}

          {/* Full Page Body Content */}
          <div
            className="prose prose-slate max-w-none text-gray-900 text-base leading-loose urdu-body space-y-4"
            dangerouslySetInnerHTML={{ __html: page.content_ur || page.content_en }}
          />

          {/* Bottom Security / Authenticity Seal */}
          <div className="pt-8 border-t border-[#eceae3] flex items-center justify-between text-xs text-gray-500 font-sans">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
              <ShieldCheck size={16} />
              <span>مصدقہ و باضابطہ شائع شدہ مواد • روزنامہ افادیت</span>
            </div>
            <Link href="/" className="hover:text-emerald-700 transition flex items-center gap-1 font-bold">
              <span>واپس صفحۂ اول</span>
            </Link>
          </div>

        </article>

        {/* Newsletter Box */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
