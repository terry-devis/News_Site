"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function EnRedirectPage() {
  const router = useRouter();
  const { setLanguage } = useSiteLanguage();

  useEffect(() => {
    setLanguage("en");
    router.replace("/");
  }, [setLanguage, router]);

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-700 font-semibold">Switching to English edition...</p>
      </div>
    </div>
  );
}
