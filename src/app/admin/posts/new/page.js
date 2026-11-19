"use client";
import React from "react";
import ArticleEditorForm from "@/component/ArticleEditorForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#dcd8cd]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
            نیا مضمون تحریر کریں
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            مضمون لکھیں، تصویر اپلوڈ کریں اور فوری شائع کریں
          </p>
        </div>
        <Link
          href="/admin/posts"
          className="text-xs text-gray-700 hover:text-emerald-700 flex items-center gap-1.5 font-semibold self-start sm:self-auto bg-white sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg border sm:border-0 border-[#dcd8cd] shadow-xs sm:shadow-none"
        >
          <span>واپس مضامین پر جائیں</span>
          <ArrowRight size={14} className="rtl:rotate-180" />
        </Link>
      </div>

      <ArticleEditorForm />
    </div>
  );
}
