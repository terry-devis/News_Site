"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Columns,
  Flame,
  MessageSquare,
  Mail,
  BarChart2,
  Megaphone,
  FolderTree,
  LayoutGrid,
  Image as ImageIcon,
  Newspaper,
  Activity,
  Users,
  ShieldCheck,
  Bell,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { AdminLanguageProvider } from "@/context/AdminLanguageContext";

function AdminLayoutInner({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveDate, setLiveDate] = useState("");

  // Live Pakistan Standard Time (PKT) formatted date matching Daily Insaaf
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      // Format as e.g. "Thursday, 19 November 2026 (PKT)"
      const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Karachi",
      };
      const formatted = new Intl.DateTimeFormat("en-GB", options).format(now);
      setLiveDate(`${formatted} (PKT)`);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Exact 17 operational modules matching Daily Insaaf Admin sequence
  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Articles", href: "/admin/articles", altHref: "/admin/posts", icon: FileText },
    { label: "Workflow board", href: "/admin/workflow", icon: Columns },
    { label: "Breaking ticker", href: "/admin/breaking", icon: Flame },
    { label: "Comments", href: "/admin/comments", icon: MessageSquare },
    { label: "Inquiries", href: "/admin/inquiries", icon: Mail },
    { label: "Polls", href: "/admin/polls", altHref: "/admin/poll", icon: BarChart2 },
    { label: "Ads", href: "/admin/ads", icon: Megaphone },
    { label: "Sections", href: "/admin/categories", icon: FolderTree },
    { label: "Layout builder", href: "/admin/layout-builder", icon: LayoutGrid },
    { label: "Media library", href: "/admin/media", icon: ImageIcon },
    { label: "E-paper", href: "/admin/epaper", icon: Newspaper },
    { label: "Services data", href: "/admin/widgets", icon: Activity },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Roles & access", href: "/admin/roles", icon: ShieldCheck },
    { label: "Email alerts", href: "/admin/notifications", icon: Bell },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f9f8f5] text-[#18221b] flex font-sans antialiased" dir="ltr">
      {/* 1. Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Persistent Newsroom Sidebar (Exact Daily Insaaf Styling) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a2618] text-[#9ebba8] flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Masthead Header with Logo */}
          <div className="px-5 py-4 border-b border-[#15452b] flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="relative h-8 w-36">
                <Image src="/logo.webp" alt="Daily Afadiat Logo" fill className="object-contain" priority />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-[#9ebba8] hover:text-white p-1 rounded"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Section Tracking Header */}
          <div className="px-5 pt-4 pb-1.5">
            <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-[#7da88d] block">
              Newsroom
            </span>
          </div>

          {/* 17 Navigation Items Menu */}
          <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto scrollbar-thin scrollbar-thumb-[#15452b]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.altHref && pathname.startsWith(item.altHref)) ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition duration-150 ${
                    isActive
                      ? "bg-[#184e2d] text-white font-semibold shadow-2xs"
                      : "text-[#9ebba8] hover:bg-[#0e3321] hover:text-white"
                  }`}
                >
                  <Icon
                    size={16}
                    className={`shrink-0 ${isActive ? "text-emerald-300" : "text-[#7da88d]"}`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Card Matching Daily Insaaf */}
        <div className="p-4 border-t border-[#15452b] bg-[#071d12]">
          <div className="mb-2">
            <p className="text-xs font-bold text-white truncate">admin@dailyafadiat.com</p>
            <p className="text-[11px] text-[#88b299] font-medium">Super Admin</p>
          </div>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-[#1f5637] hover:bg-[#143e26] text-white text-xs rounded font-medium transition cursor-pointer"
          >
            <LogOut size={13} className="text-[#88b299]" />
            <span>Sign out</span>
          </Link>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f9f8f5]">
        {/* Top Header Bar Matching Daily Insaaf */}
        <header className="h-14 bg-[#f9f8f5] border-b border-[#e5e2da] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          {/* Left Side: Mobile Hamburger + Live PKT Date */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-gray-700 hover:text-gray-900 hover:bg-[#e5e2da]/50"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <span className="text-xs sm:text-sm font-medium text-[#5c635b]">
              {liveDate || "Loading PKT date..."}
            </span>
          </div>

          {/* Right Side: View Site Pill + User Avatar Badge */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 px-3 py-1.5 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
            >
              <span>View site</span>
              <ExternalLink size={12} className="text-gray-500" />
            </Link>

            {/* Circular User Avatar Badge (A for Admin) */}
            <div
              className="w-8 h-8 rounded-full bg-[#184e2d] text-white flex items-center justify-center text-xs font-bold shadow-2xs border border-[#1f5637]"
              title="Super Admin"
            >
              A
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
