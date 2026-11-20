"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }
      router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f8f5] flex flex-col justify-center items-center px-4 py-12 font-sans antialiased" dir="ltr">
      <div className="w-full max-w-md">
        {/* Top Masthead Card */}
        <div className="bg-[#0a2618] text-white px-7 py-6 border border-[#15452b] flex items-center justify-between">
          <div className="relative h-9 w-40">
            <Image src="/logo.webp" alt="Daily Afadiat" fill className="object-contain object-left" priority />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase text-emerald-300 bg-[#15452b] px-2.5 py-1 rounded">
            <ShieldCheck size={13} />
            Newsroom
          </span>
        </div>

        {/* Form Card */}
        <div className="bg-white border-x border-b border-[#e5e2da] p-7 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-[#18221b]">Sign in to Newsroom</h1>
            <p className="text-xs text-[#5c635b] mt-1">
              Enter your staff email and password to access the Daily Afadiat editorial desk.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#18221b] mb-1.5">
                Staff Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7da88d]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="editor@dailyafadiat.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#fbfaf8] border border-[#e5e2da] text-[#18221b] focus:outline-none focus:border-[#184e2d] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18221b] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7da88d]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-[#fbfaf8] border border-[#e5e2da] text-[#18221b] focus:outline-none focus:border-[#184e2d] focus:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#184e2d] hover:bg-[#0a2618] disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>{loading ? "Signing in..." : "Sign in"}</span>
              {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e5e2da] flex items-center justify-between text-xs text-[#5c635b]">
            <Link href="/" className="hover:text-[#184e2d] font-medium transition">
              ← Back to Daily Afadiat
            </Link>
            <span>PKT • Editorial CMS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f9f8f5]" />}>
      <LoginForm />
    </Suspense>
  );
}
