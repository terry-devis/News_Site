"use client";
import React from "react";
import ArticleEditorForm from "@/component/ArticleEditorForm";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#dcd8cd]">
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
          className="text-xs text-gray-600 hover:text-emerald-700 flex items-center gap-1 font-semibold"
        >
          <span>واپس مضامین پر جائیں</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <ArticleEditorForm />
    </div>
  );
}
