import { supabase } from "@/lib/supabase";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import CommentSection from "@/component/CommentSection";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, User, Share2, ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function StoryDetail({ params }) {
  const storyIdOrSlug = params.id;
  let article = null;
  let related = [];
  let categories = [];
  let breakingNews = [];

  try {
    const [catRes, breakRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
    ]);
    if (catRes.data) categories = catRes.data;
    if (breakRes.data) breakingNews = breakRes.data;

    // Fetch article by ID or slug
    let query = supabase.from("articles").select("*, categories(*)");
    if (!isNaN(storyIdOrSlug)) {
      query = query.eq("id", parseInt(storyIdOrSlug));
    } else {
      query = query.eq("slug", storyIdOrSlug);
    }

    const { data, error } = await query.single();
    if (data) {
      article = data;
    }

    // Fetch related/recent stories
    const { data: recents } = await supabase
      .from("articles")
      .select("*, categories(*)")
      .neq("id", article?.id || 0)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recents) related = recents;
  } catch (err) {
    console.error("Story fetch error:", err);
  }

  // Fallback article if Supabase tables are still empty
  if (!article) {
    article = {
      id: 1,
      title_ur: "ڈیلی افادیت نیوز پورٹل کا باضابطہ آغاز: سچائی اور فوری خبروں کا نیا دور",
      summary_ur: "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل جدید ترین ٹیکنالوجی، شفاف رپورٹنگ اور برق رفتار لائیو اپڈیٹس کے ساتھ قارئین کے لیے پیش کر دیا گیا ہے۔",
      content_ur: `
        <p class="mb-4">ڈیلی افادیت کا مشن قارئین تک پل پل کی مصدقہ اور غیر جانبدارانہ خبریں پہنچانا ہے۔ آج کے ڈیجیٹل دور میں جہاں معلومات کا سیلاب ہے، وہاں سچ اور افواہ میں تفریق کرنا سب سے بڑی ذمہ داری ہے۔</p>
        <p class="mb-4">ہمارا ادارہ جدید ترین ٹیکنالوجی کے ذریعے پاکستان اور دنیا بھر کے اہم ترین واقعات، معیشت، سیاست، ٹیکنالوجی اور کھیل کے میدان کی خبریں آپ تک لمحہ بہ لمحہ پہنچاتا رہے گا۔</p>
        <p class="mb-4">قارئین ہماری لائیو نشریات اور ڈیجیٹل ای پیپر کے ذریعے بھی ہر خبر سے ہمہ وقت باخبر رہ سکتے ہیں۔</p>
      `,
      cover_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
      created_at: new Date().toISOString(),
      category: { name_ur: "پاکستان", slug: "pakistan" },
      author_name: "ایڈیٹوریل بورڈ ڈیلی افادیت",
    };
  }

  const shareText = encodeURIComponent(`${article.title_ur}\n\nپڑھیے ڈیلی افادیت پر:`);

  return (
    <div className="min-h-screen text-gray-900">
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-sans">
          <Link href="/" className="hover:text-emerald-600 transition">صفحہ اول</Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{article.category?.name_ur || "خبر"}</span>
        </div>

        {/* Main Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Article Main Body (8 Cols) */}
          <article className="lg:col-span-8 bg-[#efeee9] border border-[#dcd8cd] rounded-lg p-5 sm:p-7 shadow-sm">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold urdu-headline text-gray-900 leading-snug mb-4">
              {article.title_ur}
            </h1>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between border-y border-[#dcd8cd] py-3 mb-6 text-xs text-gray-600 font-sans gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-gray-800">
                  <User size={14} className="text-emerald-600" />
                  {article.author_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(article.created_at).toLocaleDateString("ur-PK", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 transition"
                >
                  <Share2 size={12} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition"
                >
                  Facebook
                </a>
              </div>
            </div>

            {/* Lead Image */}
            {article.cover_image && (
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-[#dcd8cd]/40 shadow-sm mb-6">
                <Image
                  src={article.cover_image}
                  alt={article.title_ur}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content Body */}
            <div
              className="urdu-body text-gray-800 leading-loose text-base sm:text-lg space-y-4"
              dangerouslySetInnerHTML={{ __html: article.content_ur }}
            />

            {/* Inline Article Ad Banner (Customizable via CMS) */}
            <AdSlot slotKey="article_inline_banner" className="my-6" />

            {/* Verified Comments Section (Admin Checked & Balanced) */}
            <CommentSection articleId={article.id} />
          </article>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-lg p-5 shadow-sm">
              <div className="pb-3 mb-4 border-b-2 border-emerald-600">
                <h2 className="text-lg font-bold text-gray-900">تازہ ترین خبریں</h2>
              </div>

              <div className="divide-y divide-[#dcd8cd]">
                {related.map((item) => (
                  <div key={item.id} className="py-3 flex gap-3 group">
                    <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-[#dcd8cd]/40">
                      <Image
                        src={item.cover_image || "/logo-light.webp"}
                        alt={item.title_ur}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div>
                      <Link href={`/story/${item.id || item.slug}`}>
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition line-clamp-2 leading-snug">
                          {item.title_ur}
                        </h3>
                      </Link>
                      <span className="text-xs text-gray-400 font-sans mt-1 block">
                        {new Date(item.created_at).toLocaleTimeString("ur-PK", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Ad (300x250) */}
            <AdSlot slotKey="article_sidebar_300x250" />

            {/* Newsletter Box in Sidebar */}
            <NewsletterBox variant="light" />
          </aside>

        </div>
      </main>

      {/* 3-TIER FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
