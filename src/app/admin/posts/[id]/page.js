"use client";
import React, { useState, useEffect } from "react";
import ArticleEditorForm from "@/component/ArticleEditorForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EditPostPage({ params }) {
  const { id } = params;
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadArticle() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        setArticle(data.article);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadArticle();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-500">مضمون لوڈ ہو رہا ہے...</div>;
  }

  if (!article) {
    return <div className="p-8 text-center text-xs text-red-500">مضمون نہیں ملا۔</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#dcd8cd]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
            مضمون میں ترمیم کریں
          </h1>
          <p className="text-xs text-gray-600 mt-0.5 font-mono">ID: #{article.id}</p>
        </div>
        <Link
          href="/admin/posts"
          className="text-xs text-gray-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
        >
          <span>واپس مضامین پر جائیں</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <ArticleEditorForm initialData={article} isEdit={true} />
    </div>
  );
}
