"use client";
import React from "react";
import { LayoutGrid, Plus } from "lucide-react";

export default function LayoutBuilderPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutGrid className="text-emerald-800" size={24} />
            <span>Layout builder</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Interactive visual blocks arrangement for homepage and section landings.
          </p>
        </div>
        <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition">
          <Plus size={15} />
          <span>+ Add block</span>
        </button>
      </div>

      <div className="bg-white border border-[#e5e2da] p-6 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 text-xs font-semibold">
          <span className="text-gray-500">Target Page:</span>
          <span className="bg-gray-100 text-gray-900 px-2.5 py-1 rounded border border-[#e5e2da]">Homepage (Urdu)</span>
        </div>
        <div className="border border-dashed border-[#e5e2da] p-8 text-center text-xs text-gray-400">
          Broadsheet Visual Canvas Active
        </div>
      </div>
    </div>
  );
}
