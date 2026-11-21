"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
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
  Video,
  Tv,
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
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [liveDate, setLiveDate] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;
    let active = true;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isLoginPage, pathname]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
      router.refresh();
    }
  }

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
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard, perm: null },
    { label: "Articles", href: "/admin/articles", altHref: "/admin/posts", icon: FileText, perm: "article.view" },
    { label: "Workflow board", href: "/admin/workflow", icon: Columns, perm: "workflow.manage" },
    { label: "Breaking ticker", href: "/admin/breaking", icon: Flame, perm: "breaking.manage" },
    { label: "Comments", href: "/admin/comments", icon: MessageSquare, perm: "comment.view" },
    { label: "Inquiries", href: "/admin/inquiries", icon: Mail, perm: "inquiry.view" },
    { label: "Polls", href: "/admin/polls", altHref: "/admin/poll", icon: BarChart2, perm: "poll.manage" },
    { label: "Ads", href: "/admin/ads", icon: Megaphone, perm: "ads.view" },
    { label: "Sections", href: "/admin/categories", icon: FolderTree, perm: "category.manage" },
    { label: "Layout builder", href: "/admin/layout-builder", icon: LayoutGrid, perm: "layout.manage" },
    { label: "Media library", href: "/admin/media", icon: ImageIcon, perm: "media.view" },
    { label: "E-paper", href: "/admin/epaper", icon: Newspaper, perm: "epaper.view" },
    { label: "Videos", href: "/admin/videos", icon: Video, perm: "video.manage" },
    { label: "Live TV", href: "/admin/live", icon: Tv, perm: "settings.manage" },
    { label: "Services data", href: "/admin/widgets", icon: Activity, perm: "widgets.manage" },
    { label: "Users", href: "/admin/users", icon: Users, perm: "user.view" },
    { label: "Roles & access", href: "/admin/roles", icon: ShieldCheck, perm: "role.view" },
    { label: "Email alerts", href: "/admin/notifications", icon: Bell, perm: "notification.view" },
    { label: "Settings", href: "/admin/settings", icon: Settings, perm: "settings.manage" },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  const visibleNavItems = currentUser
    ? navItems.filter((item) => !item.perm || hasPermission(currentUser, item.perm))
    : navItems;

  const extraRoutePerms = [
    { prefix: "/admin/newsletter", perm: "newsletter.manage" },
    { prefix: "/admin/pages", perm: "page.manage" },
    { prefix: "/admin/sections", perm: "category.manage" },
    { prefix: "/admin/services", perm: "widgets.manage" },
  ];
  const matchedNav =
    navItems.find(
      (item) =>
        item.href !== "/admin" &&
        (pathname === item.href ||
          pathname.startsWith(`${item.href}/`) ||
          (item.altHref && (pathname === item.altHref || pathname.startsWith(`${item.altHref}/`))))
    ) || extraRoutePerms.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
  const routePerm = matchedNav?.perm || null;
  const isRouteForbidden = Boolean(currentUser && routePerm && !hasPermission(currentUser, routePerm));
  const publicSiteUrl = process.env.NEXT_PUBLIC_APP_ROLE === "admin" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "/";
  const userEmail = currentUser?.email || "Loading...";
  const userRole = currentUser?.roles?.[0] || "Staff";
  const userInitial = (currentUser?.full_name_en || currentUser?.email || "A").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f8f5] text-[#18221b] flex font-sans antialiased" dir="ltr">
      {/* 1. Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Persistent Newsroom Sidebar (1-to-1 UI parity) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 shrink-0 bg-[#0a2618] text-emerald-100/80 flex flex-col justify-between transform transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0">
          {/* Masthead Header with Logo */}
          <div className="h-14 shrink-0 px-4 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex min-w-0 items-center" onClick={() => setSidebarOpen(false)}>
              <div className="relative h-9 w-36">
                <Image src="/logo.webp" alt="Daily Afadiat Logo" fill className="object-contain object-left" priority />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-emerald-100/70 hover:text-white p-1 rounded cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* 17 Navigation Items Menu */}
          <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15">
            <p className="mb-1.5 px-3 text-[0.625rem] font-bold tracking-[0.08em] uppercase text-emerald-200/40">
              Newsroom
            </p>
            <div className="flex flex-col gap-0.5">
              {visibleNavItems.map((item) => {
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
                    className={`relative flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[0.8125rem] transition ${
                      isActive
                        ? "bg-white/12 text-white font-semibold"
                        : "text-emerald-100/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-300" />
                    )}
                    <Icon
                      size={16}
                      strokeWidth={1.75}
                      className="shrink-0 opacity-85"
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>

        {/* Bottom User Card */}
        <div className="shrink-0 p-2 border-t border-white/10">
          <div className="mb-2 px-2 pt-1">
            <p className="text-[0.8125rem] font-semibold text-white truncate">{userEmail}</p>
            <p className="text-[11px] text-emerald-200/50 truncate">
              {currentUser?.roles?.length ? currentUser.roles.join(", ") : userRole}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 border border-white/15 hover:bg-white/10 disabled:opacity-60 text-emerald-100/80 hover:text-white text-xs rounded-md font-semibold transition cursor-pointer"
          >
            <LogOut size={13} className="opacity-80" />
            <span>{signingOut ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#f9f8f5]">
        {/* Top Header Bar */}
        <header className="h-12 shrink-0 bg-[#fbfaf8]/90 border-b border-[#e5e2da] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
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
              href={publicSiteUrl}
              target="_blank"
              className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-950 px-3 py-1.5 rounded text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition"
            >
              <span>View site</span>
              <ExternalLink size={12} className="text-gray-500" />
            </Link>

            {/* Circular User Avatar Badge */}
            <div
              className="w-8 h-8 rounded-full bg-[#184e2d] text-white flex items-center justify-center text-xs font-bold shadow-2xs border border-[#1f5637]"
              title={`${currentUser?.full_name_en || userEmail} (${userRole})`}
            >
              {userInitial}
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {isRouteForbidden ? (
              <div className="bg-white border border-[#e5e2da] rounded-lg p-8 text-center max-w-lg mx-auto mt-10 shadow-xs">
                <ShieldCheck size={36} className="mx-auto text-amber-600 mb-3" />
                <h2 className="text-lg font-bold text-gray-900 mb-1">Access Restricted</h2>
                <p className="text-sm text-gray-600 mb-5">
                  Your role ({userRole}) does not have permission (<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{routePerm}</code>) to access this section.
                </p>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 bg-[#184e2d] hover:bg-[#113820] text-white text-xs font-bold px-4 py-2 rounded transition"
                >
                  Return to Dashboard
                </Link>
              </div>
            ) : (
              children
            )}
          </div>
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
