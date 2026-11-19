"use client";
import React from "react";
import { FolderTree, Plus } from "lucide-react";

export default function CategoriesAdminPage() {
  const sections = [
    { en: "Pakistan", ur: "پاکستان", slug: "pakistan", count: 8 },
    { en: "World", ur: "انٹرنیشنل", slug: "world", count: 6 },
    { en: "Business", ur: "بزنس", slug: "business", count: 6 },
    { en: "Sports", ur: "کھیل", slug: "sports", count: 6 },
    { en: "Tech & Science", ur: "ٹیکنالوجی", slug: "tech", count: 4 },
    { en: "Entertainment", ur: "انٹرٹینمنٹ", slug: "entertainment", count: 6 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="text-emerald-800" size={24} />
            <span>Sections (Categories)</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Category taxonomy tree, URL slugs, and menu placement.
          </p>
        </div>
        <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition">
          <Plus size={15} />
          <span>+ New section</span>
        </button>
      </div>

      <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f4f2ec] border-b border-[#e5e2da] text-gray-700 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">Name (English)</th>
              <th className="p-3.5">Urdu Name (اردو نام)</th>
              <th className="p-3.5">Slug</th>
              <th className="p-3.5">Articles</th>
              <th className="p-3.5">Menu Presence</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e2da]">
            {sections.map((sec) => (
              <tr key={sec.slug} className="hover:bg-gray-50/70">
                <td className="p-3.5 font-bold text-gray-900">{sec.en}</td>
                <td className="p-3.5 urdu-headline text-sm font-bold text-gray-900">{sec.ur}</td>
                <td className="p-3.5 font-mono text-gray-500">/category/{sec.slug}</td>
                <td className="p-3.5 font-bold text-emerald-800">{sec.count}</td>
                <td className="p-3.5 text-gray-600">Header & Footer</td>
                <td className="p-3.5">
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
