"use client";
import React from "react";
import { Activity, RefreshCw } from "lucide-react";

export default function ServicesDataPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-emerald-800" size={24} />
            <span>Services data</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Prayer times, currency, gold and weather shown on the website — live or entered by hand.
          </p>
        </div>
        <button className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs">
          <RefreshCw size={13} />
          <span>Fetch live now</span>
        </button>
      </div>

      <div className="bg-white border border-[#e5e2da] p-6 shadow-2xs space-y-4">
        <div className="flex border-b border-[#e5e2da] gap-6 text-xs font-semibold">
          <button className="border-b-2 border-emerald-800 text-emerald-800 pb-2">Prayer times</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Currency (auto)</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Gold (auto)</button>
          <button className="text-gray-500 hover:text-gray-900 pb-2">Weather (MET Norway)</button>
        </div>
        <p className="text-xs text-gray-500">Live service feeds configured and syncing.</p>
      </div>
    </div>
  );
}
