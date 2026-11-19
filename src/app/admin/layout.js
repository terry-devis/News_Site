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
  Languages,
  Flame,
  Video,
  Newspaper,
  Layers,
} from "lucide-react";
import { AdminLanguageProvider, useAdminLanguage } from "@/context/AdminLanguageContext";

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { lang, setLang, t, dir } = useAdminLanguage();

  const navItems = [
    { label: t("nav_dashboard"), href: "/admin", icon: LayoutDashboard },
    { label: t("nav_breaking"), href: "/admin/breaking", icon: Flame },
    { label: t("nav_posts"), href: "/admin/posts", icon: FileText },
    { label: t("nav_new_post"), href: "/admin/posts/new", icon: PlusCircle },
    { label: t("nav_videos"), href: "/admin/videos", icon: Video },
    { label: t("nav_epaper"), href: "/admin/epaper", icon: Newspaper },
    { label: t("nav_pages"), href: "/admin/pages", icon: Layers },
    { label: t("nav_comments"), href: "/admin/comments", icon: MessageSquare },
    { label: t("nav_ads"), href: "/admin/ads", icon: Megaphone },
    { label: t("nav_settings"), href: "/admin/settings", icon: Share2 },
    { label: t("nav_newsletter"), href: "/admin/newsletter", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f3] text-gray-900 flex flex-col font-sans" dir={dir}>
      {/* Admin Top Navigation Bar */}
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
              {t("cms_title")}
            </span>
          </div>
        </div>

        {/* Right Section: Language Switcher + Visit Site */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher Pill */}
          <div className="flex items-center bg-emerald-950/80 border border-emerald-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-md transition ${
                lang === "en" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-emerald-300 hover:text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLang("ur")}
              className={`px-2.5 py-1 rounded-md transition ${
                lang === "ur" ? "bg-emerald-600 text-white font-bold shadow-xs" : "text-emerald-300 hover:text-white"
              }`}
            >
              اردو
            </button>
          </div>

          <Link
            href="/"
            target="_blank"
            className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 font-medium bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1.5 rounded-lg transition"
          >
            <ExternalLink size={13} />
            <span className="hidden sm:inline">{t("visit_website")}</span>
          </Link>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 ${dir === "rtl" ? "right-0 border-l" : "left-0 border-r"} z-40 w-64 bg-[#efeee9] border-[#dcd8cd] pt-16 lg:pt-0 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 flex flex-col justify-between ${
            sidebarOpen ? "translate-x-0 shadow-2xl" : dir === "rtl" ? "translate-x-full" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-1 overflow-y-auto">
            <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("editorial_departments")}
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
              <span>{t("verified_badge")}</span>
            </span>
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

export default function AdminLayout({ children }) {
  return (
    <AdminLanguageProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminLanguageProvider>
  );
}
