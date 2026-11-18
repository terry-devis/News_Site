"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FileText,
  PlusCircle,
  MessageSquare,
  Megaphone,
  Share2,
  Mail,
  Home,
  LayoutDashboard,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: "ڈیش بورڈ", href: "/admin", icon: LayoutDashboard },
    { label: "تمام مضامین", href: "/admin/posts", icon: FileText },
    { label: "نیا مضمون لکھیں", href: "/admin/posts/new", icon: PlusCircle },
    { label: "تبصرے اور تصدیق", href: "/admin/comments", icon: MessageSquare },
    { label: "اشتہارات کا کنٹرول", href: "/admin/ads", icon: Megaphone },
    { label: "سوشل میڈیا لنکس", href: "/admin/settings", icon: Share2 },
    { label: "نیوز لیٹر اور SMTP", href: "/admin/newsletter", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-gray-900 flex flex-col font-sans" dir="rtl">
      {/* Admin Top Bar */}
      <header className="bg-[#07130c] text-white border-b border-emerald-950 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-300 hover:text-white"
          >
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2">
            <div className="relative h-9 w-32 sm:w-40">
              <Image src="/logo.webp" alt="Daily Afadiat CMS" fill className="object-contain" />
            </div>
            <span className="hidden sm:inline bg-emerald-700/80 text-[11px] px-2 py-0.5 rounded font-bold uppercase tracking-wider text-emerald-100">
              CMS ایڈمن پینل
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1.5 rounded transition"
          >
            <ExternalLink size={13} />
            <span>ویب سائٹ دیکھیں</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-64 bg-[#efeee9] border-l border-[#dcd8cd] pt-16 lg:pt-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              ادارتی شعبہ جات
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs sm:text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "text-gray-700 hover:bg-[#dcd8cd]/50 hover:text-gray-900"
                  }`}
                >
                  <Icon size={17} className={isActive ? "text-emerald-200" : "text-emerald-700"} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#dcd8cd] text-[11px] text-gray-500 flex items-center justify-between">
            <span className="flex items-center gap-1 font-semibold text-emerald-800">
              <ShieldCheck size={14} />
              <span>مصدقہ سسٹم فعال</span>
            </span>
            <span className="font-mono text-[10px]">v2.1 R2</span>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
