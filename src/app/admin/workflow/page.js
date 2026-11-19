"use client";
import React from "react";
import { Columns, RefreshCw } from "lucide-react";

export default function WorkflowPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Columns className="text-emerald-800" size={24} />
            <span>Workflow board</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Move a story through the desk — drag it, or use the &apos;Move&apos; menu on each card. Publishing goes live.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            className="border border-[#e5e2da] bg-white px-3 py-1.5 rounded text-xs text-gray-700 outline-none"
            defaultValue={new Date().toISOString().split("T")[0]}
          />
          <button className="border border-[#e5e2da] bg-white hover:bg-gray-50 p-2 rounded text-gray-600 shadow-2xs">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* 5-Column Kanban Preview matching Daily Insaaf */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: "Draft", count: 12, dot: "bg-gray-400" },
          { title: "In review", count: 3, dot: "bg-blue-600" },
          { title: "Ready", count: 2, dot: "bg-amber-500" },
          { title: "Scheduled", count: 0, dot: "bg-purple-600" },
          { title: "Published", count: 36, dot: "bg-emerald-600" },
        ].map((col) => (
          <div key={col.title} className="bg-white border border-[#e5e2da] rounded-none shadow-2xs flex flex-col min-h-[420px]">
            <div className="p-3 border-b border-[#e5e2da] flex items-center justify-between bg-[#fbfaf8]">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-800">
                <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                <span>{col.title}</span>
              </span>
              <span className="bg-gray-100 text-gray-600 text-[11px] font-bold px-1.5 py-0.5 rounded">
                {col.count}
              </span>
            </div>
            <div className="p-3 flex-1 flex items-center justify-center text-center">
              <span className="text-xs text-gray-400">Queue active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
