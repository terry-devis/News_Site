"use client";
import React from "react";
import { ShieldCheck, Check } from "lucide-react";

export default function RolesAdminPage() {
  const roles = [
    { name: "Super Admin", code: "super_admin", perms: "41 perms", users: 1 },
    { name: "Editor-in-Chief", code: "editor_in_chief", perms: "40 perms", users: 1 },
    { name: "Editor", code: "editor", perms: "25 perms", users: 2 },
    { name: "Sub-Editor", code: "sub_editor", perms: "11 perms", users: 0 },
    { name: "Reporter", code: "reporter", perms: "6 perms", users: 3 },
    { name: "Columnist", code: "columnist", perms: "7 perms", users: 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-[#e5e2da] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="text-emerald-800" size={24} />
          <span>Roles & access</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Roles are just sets of permissions — edit them here, no code or deploy needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-[#e5e2da] p-3 shadow-2xs divide-y divide-[#e5e2da]">
          {roles.map((r, i) => (
            <div key={r.code} className={`p-3 cursor-pointer ${i === 0 ? "bg-[#f4f2ec] font-bold" : "hover:bg-gray-50"}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-900">{r.name}</span>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-mono">{r.perms}</span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono">{r.code} • {r.users} user(s)</span>
            </div>
          ))}
        </div>

        <div className="md:col-span-2 bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-4">
          <div className="border-b border-[#e5e2da] pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Super Admin</h2>
              <p className="text-xs text-gray-500">Full system control — all 41 permissions granted.</p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">41 / 41 granted</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              "article.view", "article.create", "article.edit.own", "article.edit.any",
              "article.delete", "article.publish", "article.publish.breaking", "article.schedule",
              "breaking.manage", "category.manage", "ads.manage", "comment.moderate",
              "poll.manage", "epaper.manage", "settings.manage", "seo.manage"
            ].map((p) => (
              <div key={p} className="flex items-center gap-2 p-2 bg-[#fbfaf8] border border-[#e5e2da] rounded-none">
                <div className="w-4 h-4 bg-emerald-800 text-white flex items-center justify-center rounded-xs">
                  <Check size={11} />
                </div>
                <span className="font-mono text-[11px] text-gray-700">{p}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
