"use client";
import React, { useState, useEffect } from "react";
import { CircleDollarSign, Clock } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function CurrencyWidget({ className = "" }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [rates, setRates] = useState([
    { code: "USD", name_ur: "امریکی ڈالر", name_en: "US Dollar", buy: 277.50, sell: 279.00 },
    { code: "SAR", name_ur: "سعودی ریال", name_en: "Saudi Riyal", buy: 73.85, sell: 74.50 },
    { code: "AED", name_ur: "اماراتی درہم", name_en: "UAE Dirham", buy: 75.40, sell: 75.95 },
    { code: "GBP", name_ur: "برطانوی پاؤنڈ", name_en: "British Pound", buy: 373.20, sell: 376.50 },
    { code: "EUR", name_ur: "یورو", name_en: "Euro", buy: 308.80, sell: 312.40 },
    { code: "CNY", name_ur: "چینی یوآن", name_en: "Chinese Yuan", buy: 41.20, sell: 41.65 },
  ]);
  const [timestamp, setTimestamp] = useState("19 Nov, 12:00");
  const [goldRates, setGoldRates] = useState({
    gold24k: "422,095",
    gold22k: "386,920",
  });

  useEffect(() => {
    let isMounted = true;
    async function fetchRates() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (isMounted && data.result === "success" && data.rates) {
          const usdPkr = data.rates.PKR || 277.5;
          const sarUsd = data.rates.SAR || 3.75;
          const aedUsd = data.rates.AED || 3.67;
          const gbpUsd = data.rates.GBP || 0.79;
          const eurUsd = data.rates.EUR || 0.95;
          const cnyUsd = data.rates.CNY || 7.24;

          const calcRate = (foreignPerUsd, spread = 0.006) => {
            const pkrRate = usdPkr / foreignPerUsd;
            return {
              buy: (pkrRate * (1 - spread)).toFixed(2),
              sell: (pkrRate * (1 + spread)).toFixed(2),
            };
          };

          const usdSpread = {
            buy: (usdPkr * 0.995).toFixed(2),
            sell: (usdPkr * 1.005).toFixed(2),
          };
          const sarSpread = calcRate(sarUsd);
          const aedSpread = calcRate(aedUsd);
          const gbpSpread = calcRate(gbpUsd);
          const eurSpread = calcRate(eurUsd);
          const cnySpread = calcRate(cnyUsd);

          setRates([
            { code: "USD", name_ur: "امریکی ڈالر", name_en: "US Dollar", buy: usdSpread.buy, sell: usdSpread.sell },
            { code: "SAR", name_ur: "سعودی ریال", name_en: "Saudi Riyal", buy: sarSpread.buy, sell: sarSpread.sell },
            { code: "AED", name_ur: "اماراتی درہم", name_en: "UAE Dirham", buy: aedSpread.buy, sell: aedSpread.sell },
            { code: "GBP", name_ur: "برطانوی پاؤنڈ", name_en: "British Pound", buy: gbpSpread.buy, sell: gbpSpread.sell },
            { code: "EUR", name_ur: "یورو", name_en: "Euro", buy: eurSpread.buy, sell: eurSpread.sell },
            { code: "CNY", name_ur: "چینی یوآن", name_en: "Chinese Yuan", buy: cnySpread.buy, sell: cnySpread.sell },
          ]);

          const d = new Date();
          const timeStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " +
            d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          setTimestamp(timeStr);
        }
      } catch (err) {
        console.error("Currency API error:", err);
      }
    }
    fetchRates();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div
      className={`bg-white border border-[#dcd8cd] rounded shadow-2xs font-sans overflow-hidden ${className}`}
      dir={dir}
    >
      {/* Header Bar matching Daily Insaaf */}
      <div className="p-3.5 border-b border-[#eceae3] flex items-center justify-between bg-[#fbfbfa]">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <CircleDollarSign size={17} className="text-emerald-700" />
          <h3 className={`font-bold text-sm text-gray-900 ${isUrdu ? "urdu-headline text-[15px]" : "font-sans"}`}>
            {isUrdu ? "کرنسی ریٹ و سونا" : "Currency & Gold Rates"}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-sans">
          <Clock size={11} />
          <span>{timestamp}</span>
        </div>
      </div>

      <div className="p-3.5 space-y-3.5">
        {/* Gold Bullion Highlights (Daily Insaaf gold blocks) */}
        <div className="grid grid-cols-2 gap-2 bg-[#fdfbf6] p-2.5 rounded border border-amber-200/80">
          {/* 24K Gold */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium mb-0.5">
              <span className="w-2 h-2 rounded-2xs bg-amber-500 inline-block"></span>
              <span>{isUrdu ? "سونا 24 قیراط / تولہ" : "Gold 24K / Tola"}</span>
            </div>
            <div className="text-sm sm:text-[15px] font-extrabold text-amber-700 font-sans">
              ₨ {goldRates.gold24k}
            </div>
          </div>

          {/* 22K Gold */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-gray-600 font-medium mb-0.5">
              <span className="w-2 h-2 rounded-2xs bg-amber-400 inline-block"></span>
              <span>{isUrdu ? "سونا 22 قیراط / تولہ" : "Gold 22K / Tola"}</span>
            </div>
            <div className="text-sm sm:text-[15px] font-extrabold text-amber-700 font-sans">
              ₨ {goldRates.gold22k}
            </div>
          </div>
        </div>

        {/* Forex Exchange Rates Table */}
        <div className="border border-[#eceae3] rounded overflow-hidden">
          <table className="w-full text-xs text-right">
            <thead className="bg-[#f7f6f3] text-gray-500 border-b border-[#eceae3] font-bold text-[11px]">
              <tr>
                <th className={`py-2 px-3 ${isUrdu ? "text-right" : "text-left"}`}>
                  {isUrdu ? "کرنسی" : "Currency"}
                </th>
                <th className="py-2 px-3 text-center">{isUrdu ? "خرید" : "Buy"}</th>
                <th className="py-2 px-3 text-center">{isUrdu ? "فروخت" : "Sell"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {rates.map((item) => (
                <tr key={item.code} className="hover:bg-[#fbfbfa] transition-colors">
                  <td className={`py-1.5 px-3 font-medium text-gray-800 ${isUrdu ? "text-right" : "text-left"}`}>
                    <span className="font-bold text-gray-900">{item.code}</span>{" "}
                    <span className="text-[11px] text-gray-500">
                      ({isUrdu ? item.name_ur : item.name_en})
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-center font-bold text-emerald-800 tracking-tight">
                    {item.buy}
                  </td>
                  <td className="py-1.5 px-3 text-center font-bold text-gray-700 tracking-tight">
                    {item.sell}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Disclaimer Citation */}
        <p className="text-[10px] text-gray-400 text-center font-sans">
          {isUrdu
            ? "کرنسی: اوپن مارکیٹ و بین البینک | سونا: صرافہ مارکیٹ کراچی"
            : "Currency: Interbank & Open Market | Gold: Sarafa Market"}
        </p>
      </div>
    </div>
  );
}
