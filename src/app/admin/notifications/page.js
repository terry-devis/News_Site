"use client";
import React from "react";
import { Bell } from "lucide-react";

export default function NotificationsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-[#e5e2da] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="text-emerald-800" size={24} />
          <span>Email alerts</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Role-based activity alert matrix with priority routing and delivery audit log.
        </p>
      </div>

      <div className="bg-white border border-[#e5e2da] p-6 shadow-2xs space-y-4">
        <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">System Activity Matrix</h2>
        <p className="text-xs text-gray-500">Alert routing configured for critical newsroom events.</p>
      </div>
    </div>
  );
}
