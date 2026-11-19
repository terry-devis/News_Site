"use client";
import React from "react";
import { Mail } from "lucide-react";

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#e5e2da] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="text-emerald-800" size={24} />
          <span>Inquiries</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Reader contact submissions and advertising inquiry threads.
        </p>
      </div>

      <div className="bg-white border border-[#e5e2da] p-6 shadow-2xs">
        <div className="flex border-b border-[#e5e2da] gap-4 mb-4 text-xs font-semibold">
          <button className="border-b-2 border-emerald-800 text-emerald-800 pb-2">Unread (0)</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Read (2)</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Replied (5)</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Archived (0)</button>
        </div>
        <p className="text-xs text-gray-500">Inquiry queue active.</p>
      </div>
    </div>
  );
}
