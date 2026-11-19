"use client";
import React from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

export default function MediaLibraryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ImageIcon className="text-emerald-800" size={24} />
            <span>Media library</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Cloud media asset repository with responsive focal point cropping.
          </p>
        </div>
        <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition">
          <Upload size={15} />
          <span>Upload media</span>
        </button>
      </div>

      <div className="border-2 border-dashed border-[#e5e2da] bg-white p-10 text-center rounded">
        <Upload size={28} className="text-gray-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-gray-700">Drag and drop images here, or browse files</p>
        <p className="text-[11px] text-gray-400 mt-1">JPEG, PNG, WebP, AVIF up to 10MB</p>
      </div>
    </div>
  );
}
