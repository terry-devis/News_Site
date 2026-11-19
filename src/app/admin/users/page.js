"use client";
import React from "react";
import { Users, Plus } from "lucide-react";

export default function UsersAdminPage() {
  const users = [
    { name: "Super Admin", email: "admin@dailyafadiat.com", role: "Super Admin", status: "Active" },
    { name: "Editorial Board", email: "editor@dailyafadiat.com", role: "Editor-in-Chief", status: "Active" },
    { name: "News Desk", email: "desk@dailyafadiat.com", role: "Editor", status: "Active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-emerald-800" size={24} />
            <span>Users</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Newsroom user accounts, author bylines, designation, and desk scopes.
          </p>
        </div>
        <button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 transition">
          <Plus size={15} />
          <span>+ New user</span>
        </button>
      </div>

      <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#f4f2ec] border-b border-[#e5e2da] text-gray-700 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-3.5">User</th>
              <th className="p-3.5">Email</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e2da]">
            {users.map((u) => (
              <tr key={u.email} className="hover:bg-gray-50/70">
                <td className="p-3.5 font-bold text-gray-900">{u.name}</td>
                <td className="p-3.5 text-gray-600">{u.email}</td>
                <td className="p-3.5">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {u.role}
                  </span>
                </td>
                <td className="p-3.5">
                  <span className="text-emerald-700 font-semibold">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
