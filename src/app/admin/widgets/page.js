"use client";
import React, { useState, useEffect } from "react";
import { toPublicSiteUrl } from "@/lib/publicUrl";
import {
  Activity,
  RefreshCw,
  Clock,
  CircleDollarSign,
  Sun,
  CloudSun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  ExternalLink,
  Check,
  X,
  Lock,
  Unlock,
  AlertTriangle,
  ChevronDown,
  Sparkles,
  Coins,
} from "lucide-react";

export default function ServicesDataPage() {
  const [activeTab, setActiveTab] = useState("prayer"); // "prayer" | "currency" | "gold" | "weather"
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Widgets state
  const [selectedCity, setSelectedCity] = useState("Karachi");
  const [prayerSettings, setPrayerSettings] = useState({
    showOnWebsite: true,
    asrShown: "both",
    hijriAdjustment: 0,
    calculationMethod: "University of Islamic Sciences, Karachi (Fajr & Isha 18°)",
  });
  const [timetable, setTimetable] = useState([]);
  const [citiesList, setCitiesList] = useState([]);

  // Currency state
  const [currencyData, setCurrencyData] = useState({
    showOnWebsite: true,
    mode: "manual",
    rates: [],
    updatedAt: "Manual · 20 Nov 2026, 09:30",
  });

  // Gold state
  const [goldData, setGoldData] = useState({
    showOnWebsite: true,
    mode: "manual",
    premium: 0,
    gold24k: 422095,
    gold22k: 389402,
    updatedAt: "Manual · 20 Nov 2026, 09:30",
  });

  // Weather state
  const [weatherData, setWeatherData] = useState({
    showOnWebsite: true,
    mode: "manual",
    cities: [],
    updatedAt: "Manual · 20 Nov 2026, 09:30",
  });

  // Modals
  const [editPrayerModal, setEditPrayerModal] = useState(null); // day object or null
  const [editWeatherModal, setEditWeatherModal] = useState(null); // city object or null

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch data
  const loadWidgets = async (city = selectedCity) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/widgets?city=${city}`);
      const data = await res.json();
      if (data.success) {
        if (data.prayer) {
          setPrayerSettings({
            showOnWebsite: data.prayer.showOnWebsite ?? true,
            asrShown: data.prayer.asrShown || "both",
            hijriAdjustment: data.prayer.hijriAdjustment ?? 0,
            calculationMethod: data.prayer.calculationMethod || "Karachi",
          });
          setTimetable(data.prayer.timetable || []);
          setCitiesList(data.prayer.cities || []);
        }
        if (data.currency) {
          setCurrencyData(data.currency);
        }
        if (data.gold) {
          setGoldData(data.gold);
        }
        if (data.weather) {
          setWeatherData(data.weather);
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load services data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWidgets(selectedCity);
  }, [selectedCity]);

  // Handler: Save Prayer Settings
  const handleSavePrayerSettings = async (updates) => {
    const newSettings = { ...prayerSettings, ...updates };
    setPrayerSettings(newSettings);
    try {
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prayer_settings", settings: newSettings }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Prayer settings updated");
      }
    } catch (e) {
      showToast("Failed to update prayer settings", "error");
    }
  };

  // Handler: Recalculate Prayer Times
  const handleRecalculatePrayer = async () => {
    setSaving(true);
    await loadWidgets(selectedCity);
    setSaving(false);
    showToast(`Recalculated 31-day prayer timetable for ${selectedCity}`);
  };

  // Handler: Save Prayer Day Override
  const handleSaveDayOverride = async () => {
    if (!editPrayerModal) return;
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prayer_override",
          city: selectedCity,
          date: editPrayerModal.date,
          data: {
            fajr: editPrayerModal.fajr,
            sunrise: editPrayerModal.sunrise,
            dhuhr: editPrayerModal.dhuhr,
            asrShafi: editPrayerModal.asrShafi,
            asrHanafi: editPrayerModal.asrHanafi,
            maghrib: editPrayerModal.maghrib,
            isha: editPrayerModal.isha,
            hijri: editPrayerModal.hijri,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Saved and locked prayer times for ${editPrayerModal.date}`);
        setEditPrayerModal(null);
        await loadWidgets(selectedCity);
      }
    } catch (e) {
      showToast("Failed to save day override", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Reset Prayer Day Override
  const handleResetDayOverride = async () => {
    if (!editPrayerModal) return;
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prayer_reset",
          city: selectedCity,
          date: editPrayerModal.date,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Reset ${editPrayerModal.date} to automatic calculation`);
        setEditPrayerModal(null);
        await loadWidgets(selectedCity);
      }
    } catch (e) {
      showToast("Failed to reset day override", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Currency Rates Edit
  const handleRateChange = (index, field, value) => {
    const updated = [...currencyData.rates];
    updated[index] = { ...updated[index], [field]: value };
    setCurrencyData({ ...currencyData, rates: updated });
  };

  const handleSaveCurrency = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "currency",
          rates: currencyData.rates,
          mode: "manual",
          showOnWebsite: currencyData.showOnWebsite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrencyData(data.currency);
        showToast("Currency rates saved as manual");
      }
    } catch (e) {
      showToast("Failed to save currency rates", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Gold Rates Save
  const handleSaveGold = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gold",
          gold: {
            ...goldData,
            mode: "manual",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGoldData(data.gold);
        showToast("Gold prices saved as manual");
      }
    } catch (e) {
      showToast("Failed to save gold prices", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Gold Premium Save
  const handleSaveGoldPremium = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "gold",
          gold: {
            ...goldData,
            premium: Number(goldData.premium) || 0,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGoldData(data.gold);
        showToast("Gold local premium updated");
      }
    } catch (e) {
      showToast("Failed to save gold premium", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Weather Save
  const handleSaveWeatherCity = async () => {
    if (!editWeatherModal) return;
    try {
      setSaving(true);
      const updatedCities = weatherData.cities.map((c) =>
        c.city === editWeatherModal.city ? editWeatherModal : c
      );
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "weather",
          cities: updatedCities,
          mode: "manual",
          showOnWebsite: weatherData.showOnWebsite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWeatherData(data.weather);
        setEditWeatherModal(null);
        showToast(`Saved weather for ${editWeatherModal.city} as manual`);
      }
    } catch (e) {
      showToast("Failed to save weather data", "error");
    } finally {
      setSaving(false);
    }
  };

  // Handler: Fetch Live Feeds
  const handleFetchLive = async (serviceType) => {
    try {
      setSaving(true);
      const res = await fetch("/api/widgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "fetch_live", serviceType }),
      });
      const data = await res.json();
      if (data.success) {
        if (serviceType === "currency" && data.widgets.currency) {
          setCurrencyData(data.widgets.currency);
          showToast("Fetched live interbank currency rates");
        } else if (serviceType === "gold" && data.widgets.gold) {
          setGoldData(data.widgets.gold);
          showToast("Fetched live international gold prices");
        } else if (serviceType === "weather" && data.widgets.weather) {
          setWeatherData(data.widgets.weather);
          showToast("Fetched live MET Norway meteorological data");
        }
      }
    } catch (e) {
      showToast(`Failed to fetch live ${serviceType} data`, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded shadow-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-emerald-800 text-white border-emerald-900"
          }`}
        >
          {toast.type === "error" ? <AlertTriangle size={14} /> : <Check size={14} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="text-emerald-800" size={24} />
            <span>Services data</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Prayer times, currency, gold and weather shown on the website — live or entered by hand.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={toPublicSiteUrl("/")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 border border-[#e5e2da] px-3 py-1.5 rounded bg-white hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <span>View site</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 4 Horizontal Service Tabs */}
      <div className="border-b border-[#e5e2da] flex gap-2 sm:gap-6 text-xs font-semibold overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab("prayer")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "prayer"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Prayer times</span>
        </button>

        <button
          onClick={() => setActiveTab("currency")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "currency"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Currency</span>
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              currencyData.mode === "manual"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            {currencyData.mode}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("gold")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "gold"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Gold</span>
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              goldData.mode === "manual"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            {goldData.mode}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("weather")}
          className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "weather"
              ? "border-emerald-800 text-emerald-800"
              : "border-transparent text-gray-500 hover:text-gray-800"
          }`}
        >
          <span>Weather</span>
          <span
            className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              weatherData.mode === "manual"
                ? "bg-amber-100 text-amber-800 border border-amber-300"
                : "bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            {weatherData.mode}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: PRAYER TIMES */}
      {/* ======================================================== */}
      {activeTab === "prayer" && (
        <div className="space-y-6">
          {/* Top Controls Strip */}
          <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prayerSettings.showOnWebsite}
                  onChange={(e) => handleSavePrayerSettings({ showOnWebsite: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Show on website</span>
                  <span className="text-[11px] text-gray-500">Visible on the homepage, services page and ticker</span>
                </div>
              </label>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRecalculatePrayer}
                  disabled={saving}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <RefreshCw size={13} className={saving ? "animate-spin text-emerald-800" : ""} />
                  <span>Recalculate now</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#e5e2da]">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Asr shown on the website
                </label>
                <select
                  value={prayerSettings.asrShown}
                  onChange={(e) => handleSavePrayerSettings({ asrShown: e.target.value })}
                  className="w-full text-xs border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                >
                  <option value="both">Both — Hanafi and Shafi</option>
                  <option value="hanafi">Hanafi</option>
                  <option value="shafi">Shafi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Hijri date adjustment
                </label>
                <select
                  value={prayerSettings.hijriAdjustment}
                  onChange={(e) => handleSavePrayerSettings({ hijriAdjustment: Number(e.target.value) })}
                  className="w-full text-xs border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                >
                  <option value={1}>+1 day</option>
                  <option value={0}>0 days</option>
                  <option value={-1}>-1 day</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Pakistan’s moon sighting can differ from the calculated date.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic pt-2">
              Calculated: University of Islamic Sciences, Karachi (Fajr & Isha 18°). Both Asr times are always computed.
            </p>
          </div>

          {/* 31-Day Timetable Card */}
          <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e5e2da] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#faf9f6]">
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wider uppercase">Timetable</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  The next 31 days. Edit a day to correct it by hand — it is then locked and the hourly recalculation leaves it alone until you reset it. Today: Jumada II 11, 1448 AH.
                </p>
              </div>

              {/* City selector dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">City:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="text-xs font-bold border border-[#e5e2da] rounded px-3 py-1.5 bg-white text-gray-900 focus:outline-emerald-800 shadow-2xs"
                >
                  {citiesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_en} ({c.name_ur})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e2da] bg-gray-50/70 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Fajr</th>
                    <th className="py-2.5 px-3">Sunrise</th>
                    <th className="py-2.5 px-3">Dhuhr</th>
                    <th className="py-2.5 px-3">Asr (Shafi)</th>
                    <th className="py-2.5 px-3">Asr (Hanafi)</th>
                    <th className="py-2.5 px-3">Maghrib</th>
                    <th className="py-2.5 px-3">Isha</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e2da]">
                  {timetable.map((row, idx) => (
                    <tr
                      key={row.date}
                      className={`hover:bg-[#f9f8f5] transition-colors ${
                        idx === 0 ? "bg-emerald-50/40 font-medium" : ""
                      }`}
                    >
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-900">{row.date}</span>
                          {idx === 0 && (
                            <span className="text-[10px] bg-emerald-800 text-white font-bold px-1.5 py-0.2 rounded">
                              Today
                            </span>
                          )}
                          {row.locked && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-amber-300">
                              <Lock size={10} />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 block">{row.hijri}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.fajr}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-600">{row.sunrise}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.dhuhr}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.asrShafi}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.asrHanafi}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.maghrib}</td>
                      <td className="py-2.5 px-3 font-mono text-gray-800">{row.isha}</td>
                      <td className="py-2.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditPrayerModal(row)}
                          className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: FOREIGN CURRENCY RATES */}
      {/* ======================================================== */}
      {activeTab === "currency" && (
        <div className="space-y-6">
          {/* Controls Strip */}
          <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={currencyData.showOnWebsite}
                  onChange={(e) =>
                    setCurrencyData({ ...currencyData, showOnWebsite: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Show on website</span>
                  <span className="text-[11px] text-gray-500">
                    Visible on the homepage ticker, currency widget and services page
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                  {currencyData.mode === "manual" ? "Manual · auto-update off" : "Auto · live sync on"}
                </span>
                <button
                  onClick={() => handleFetchLive("currency")}
                  disabled={saving}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <RefreshCw size={13} className={saving ? "animate-spin text-emerald-800" : ""} />
                  <span>Fetch live now</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic pt-2 border-t border-[#e5e2da]">
              Auto source: interbank mid-market rates (ExchangeRate-API), published once a day.
            </p>
          </div>

          {/* Rates Table Card */}
          <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e5e2da] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#faf9f6]">
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wider uppercase">
                  Rates on the website
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Edit any figure and save to switch currency to manual. Interbank publishes one mid-market rate, so buy and sell start equal — enter an open-market spread if you track one.
                </p>
              </div>

              <button
                onClick={handleSaveCurrency}
                disabled={saving}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs transition-colors self-start sm:self-auto"
              >
                Save as manual
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e2da] bg-gray-50/70 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">Currency</th>
                    <th className="py-2.5 px-4">Buy (PKR)</th>
                    <th className="py-2.5 px-4">Sell (PKR)</th>
                    <th className="py-2.5 px-4 text-right">Source · updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e2da]">
                  {currencyData.rates.map((rate, idx) => (
                    <tr key={rate.code} className="hover:bg-[#f9f8f5] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 font-mono text-sm">{rate.code}</span>
                          <span className="text-xs text-gray-500 font-nastaliq">{rate.name_ur}</span>
                          <span className="text-[11px] text-gray-400">({rate.name_en})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={rate.buy}
                          onChange={(e) => handleRateChange(idx, "buy", e.target.value)}
                          className="w-28 text-xs font-mono font-bold border border-[#e5e2da] rounded px-2.5 py-1.5 bg-white text-gray-900 focus:outline-emerald-800"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          value={rate.sell}
                          onChange={(e) => handleRateChange(idx, "sell", e.target.value)}
                          className="w-28 text-xs font-mono font-bold border border-[#e5e2da] rounded px-2.5 py-1.5 bg-white text-gray-900 focus:outline-emerald-800"
                        />
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-gray-500 font-mono">
                        {rate.source || currencyData.updatedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: GOLD PRICES */}
      {/* ======================================================== */}
      {activeTab === "gold" && (
        <div className="space-y-6">
          {/* Top Settings Card */}
          <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={goldData.showOnWebsite}
                  onChange={(e) => setGoldData({ ...goldData, showOnWebsite: e.target.checked })}
                  className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Show on website</span>
                  <span className="text-[11px] text-gray-500">
                    Visible in the gold rate widget and financial services ticker
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                  {goldData.mode === "manual" ? "Manual · auto-update off" : "Auto · live sync on"}
                </span>
                <button
                  onClick={() => handleFetchLive("gold")}
                  disabled={saving}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <RefreshCw size={13} className={saving ? "animate-spin text-emerald-800" : ""} />
                  <span>Fetch live now</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e5e2da] max-w-md">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Premium over international price (PKR per tola, 24k)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={goldData.premium}
                  onChange={(e) => setGoldData({ ...goldData, premium: e.target.value })}
                  className="w-full text-xs font-mono font-bold border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                />
                <button
                  onClick={handleSaveGoldPremium}
                  disabled={saving}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-800 px-3 py-2 rounded text-xs font-semibold shadow-2xs whitespace-nowrap transition-colors"
                >
                  Save premium
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Local Sarafa rates usually sit above the international price. Applied in auto mode; 22k is derived (22/24).
              </p>
            </div>

            <p className="text-[11px] text-gray-500 italic pt-2 border-t border-[#e5e2da]">
              Auto source: international gold price, converted to PKR per tola, plus your premium.
            </p>
          </div>

          {/* Rates Card */}
          <div className="bg-white border border-[#e5e2da] shadow-2xs p-5 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e2da] pb-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900 tracking-wider uppercase">
                  Gold on the website
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Enter rates per tola in Pakistani Rupees. 22 karat is automatically derived unless manually overridden.
                </p>
              </div>
              <div className="text-[11px] text-gray-500 font-mono">
                {goldData.updatedAt}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>24 karat — PKR per tola</span>
                  <span className="text-[11px] text-gray-400 font-normal">خالص سونا</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={goldData.gold24k}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      setGoldData({
                        ...goldData,
                        gold24k: v,
                        gold22k: Math.round((v * 22) / 24),
                      });
                    }}
                    className="w-full text-sm font-mono font-bold border border-[#e5e2da] rounded pl-10 pr-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center justify-between">
                  <span>22 karat — PKR per tola</span>
                  <span className="text-[11px] text-gray-400 font-normal">زیورات سونا</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-bold">Rs.</span>
                  <input
                    type="number"
                    value={goldData.gold22k}
                    onChange={(e) => setGoldData({ ...goldData, gold22k: Number(e.target.value) || 0 })}
                    className="w-full text-sm font-mono font-bold border border-[#e5e2da] rounded pl-10 pr-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveGold}
                disabled={saving}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded text-xs font-semibold shadow-2xs transition-colors"
              >
                Save as manual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WEATHER DATA */}
      {/* ======================================================== */}
      {activeTab === "weather" && (
        <div className="space-y-6">
          {/* Top Settings Strip */}
          <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={weatherData.showOnWebsite}
                  onChange={(e) =>
                    setWeatherData({ ...weatherData, showOnWebsite: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Show on website</span>
                  <span className="text-[11px] text-gray-500">
                    Visible on header bar, weather widget and national forecast ticker
                  </span>
                </div>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium">
                  {weatherData.mode === "manual" ? "Manual · auto-update off" : "Auto · live sync on"}
                </span>
                <button
                  onClick={() => handleFetchLive("weather")}
                  disabled={saving}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-1.5 rounded text-xs font-semibold text-gray-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                >
                  <RefreshCw size={13} className={saving ? "animate-spin text-emerald-800" : ""} />
                  <span>Fetch live now</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 italic pt-2 border-t border-[#e5e2da]">
              Auto source: MET Norway forecast, every 30 minutes (credited on the site, as its licence requires).
            </p>
          </div>

          {/* Weather Table Card */}
          <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#e5e2da] bg-[#faf9f6]">
              <h2 className="text-sm font-bold text-gray-900 tracking-wider uppercase">
                Weather on the website
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Current observations across key provincial centers. Click Edit to adjust values or condition descriptions manually.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e5e2da] bg-gray-50/70 text-gray-600 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4">City</th>
                    <th className="py-2.5 px-3">Now</th>
                    <th className="py-2.5 px-3">Feels</th>
                    <th className="py-2.5 px-3">Humidity</th>
                    <th className="py-2.5 px-3">Wind</th>
                    <th className="py-2.5 px-4">Source · updated</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e2da]">
                  {weatherData.cities.map((city) => (
                    <tr key={city.city} className="hover:bg-[#f9f8f5] transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">{city.city}</span>
                          <span className="text-xs text-gray-500 font-nastaliq">({city.name_ur})</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium text-gray-900">
                          <span>{city.icon || "☀️"}</span>
                          <span className="font-bold">{city.temp}°C</span>
                          <span className="text-[11px] text-gray-500">· {city.condition}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700">{city.feels}°C</td>
                      <td className="py-3 px-3 text-gray-600">{city.humidity}%</td>
                      <td className="py-3 px-3 text-gray-600">{city.wind} km/h</td>
                      <td className="py-3 px-4 text-[11px] text-gray-500 font-mono">
                        {city.source || weatherData.updatedAt}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setEditWeatherModal({ ...city })}
                          className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1 rounded text-xs font-semibold shadow-2xs transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: EDIT PRAYER DAY */}
      {/* ======================================================== */}
      {editPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Correct {editPrayerModal.date} — {selectedCity}
              </h3>
              <button
                onClick={() => setEditPrayerModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>Saved times are locked from the hourly recalculation until you reset the day.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fajr</label>
                <input
                  type="text"
                  value={editPrayerModal.fajr}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, fajr: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sunrise</label>
                <input
                  type="text"
                  value={editPrayerModal.sunrise}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, sunrise: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dhuhr</label>
                <input
                  type="text"
                  value={editPrayerModal.dhuhr}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, dhuhr: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Asr (Shafi)</label>
                <input
                  type="text"
                  value={editPrayerModal.asrShafi}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, asrShafi: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Asr (Hanafi)</label>
                <input
                  type="text"
                  value={editPrayerModal.asrHanafi}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, asrHanafi: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Maghrib</label>
                <input
                  type="text"
                  value={editPrayerModal.maghrib}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, maghrib: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Isha</label>
                <input
                  type="text"
                  value={editPrayerModal.isha}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, isha: e.target.value })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Hijri date</label>
                <input
                  type="text"
                  value={editPrayerModal.hijri}
                  onChange={(e) => setEditPrayerModal({ ...editPrayerModal, hijri: e.target.value })}
                  className="w-full border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#e5e2da]">
              {editPrayerModal.locked ? (
                <button
                  type="button"
                  onClick={handleResetDayOverride}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <Unlock size={13} />
                  <span>Reset to auto calculation</span>
                </button>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditPrayerModal(null)}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDayOverride}
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs"
                >
                  Save and lock
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT CITY WEATHER */}
      {/* ======================================================== */}
      {editWeatherModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3">
              <h3 className="text-sm font-bold text-gray-900">
                Weather — {editWeatherModal.city} ({editWeatherModal.name_ur})
              </h3>
              <button
                onClick={() => setEditWeatherModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>Saving switches weather to manual for all cities, so the live feed stops overwriting it.</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Temperature (°C)</label>
                <input
                  type="number"
                  value={editWeatherModal.temp}
                  onChange={(e) => setEditWeatherModal({ ...editWeatherModal, temp: Number(e.target.value) })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Feels like (°C)</label>
                <input
                  type="number"
                  value={editWeatherModal.feels}
                  onChange={(e) => setEditWeatherModal({ ...editWeatherModal, feels: Number(e.target.value) })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Humidity (%)</label>
                <input
                  type="number"
                  value={editWeatherModal.humidity}
                  onChange={(e) => setEditWeatherModal({ ...editWeatherModal, humidity: Number(e.target.value) })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Wind (km/h)</label>
                <input
                  type="number"
                  value={editWeatherModal.wind}
                  onChange={(e) => setEditWeatherModal({ ...editWeatherModal, wind: Number(e.target.value) })}
                  className="w-full font-mono font-bold border border-[#e5e2da] rounded px-3 py-1.5 focus:outline-emerald-800"
                />
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-semibold text-gray-700 mb-1">Condition</label>
              <select
                value={editWeatherModal.condition}
                onChange={(e) => {
                  const val = e.target.value;
                  let ic = "☀️";
                  if (val.includes("Mostly")) ic = "🌤️";
                  else if (val.includes("Partly")) ic = "⛅";
                  else if (val.includes("Overcast")) ic = "☁️";
                  else if (val.includes("Rain")) ic = "🌧️";
                  else if (val.includes("Haze")) ic = "🌫️";
                  setEditWeatherModal({ ...editWeatherModal, condition: val, icon: ic });
                }}
                className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
              >
                <option value="Clear — صاف">☀️ Clear — صاف</option>
                <option value="Mostly clear — جزوی مطلع صاف">🌤️ Mostly clear — جزوی مطلع صاف</option>
                <option value="Partly cloudy — جزوی ابر آلود">⛅ Partly cloudy — جزوی ابر آلود</option>
                <option value="Overcast — مطلع ابر آلود">☁️ Overcast — مطلع ابر آلود</option>
                <option value="Rain — بارش">🌧️ Rain — بارش</option>
                <option value="Haze — دھند/گرد">🌫️ Haze — دھند/گرد</option>
                <option value="Sunny & dry — سرد و خشک">☀️ Sunny & dry — سرد و خشک</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e2da]">
              <button
                type="button"
                onClick={() => setEditWeatherModal(null)}
                className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWeatherCity}
                disabled={saving}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs"
              >
                Save as manual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
