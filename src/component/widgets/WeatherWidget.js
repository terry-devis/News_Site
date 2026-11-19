"use client";
import React, { useState, useEffect } from "react";
import { CloudSun, Sun, Cloud, CloudRain, Wind, Droplets, Thermometer, Clock, MapPin } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

const CITIES = [
  { id: "Islamabad", name_ur: "اسلام آباد", name_en: "Islamabad", lat: 33.6844, lon: 73.0479 },
  { id: "Lahore", name_ur: "لاہور", name_en: "Lahore", lat: 31.5497, lon: 74.3436 },
  { id: "Karachi", name_ur: "کراچی", name_en: "Karachi", lat: 24.8607, lon: 67.0011 },
  { id: "Peshawar", name_ur: "پشاور", name_en: "Peshawar", lat: 34.0151, lon: 71.5249 },
  { id: "Quetta", name_ur: "کوئٹہ", name_en: "Quetta", lat: 30.1798, lon: 66.9750 },
];

export default function WeatherWidget({ className = "" }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [weather, setWeather] = useState({
    temp: 22,
    apparent: 21,
    humidity: 48,
    wind: 10,
    code: 0,
  });
  const [timestamp, setTimestamp] = useState("19 Nov, 12:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchWeather() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=Asia/Karachi`
        );
        const data = await res.json();
        if (isMounted && data.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            apparent: Math.round(data.current.apparent_temperature),
            humidity: Math.round(data.current.relative_humidity_2m),
            wind: Math.round(data.current.wind_speed_10m),
            code: data.current.weather_code,
          });
          const d = new Date();
          const timeStr =
            d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
            ", " +
            d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
          setTimestamp(timeStr);
        }
      } catch (err) {
        console.error("Weather API error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchWeather();
    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Decode WMO code into description & harmonious icon
  const getWeatherInfo = (code) => {
    if (code === 0) {
      return {
        text_ur: "صاف موسم",
        text_en: "Clear Sky",
        icon: <Sun size={36} className="text-yellow-500" />,
      };
    }
    if (code >= 1 && code <= 3) {
      return {
        text_ur: "جزوی ابر آلود",
        text_en: "Partly Cloudy",
        icon: <CloudSun size={36} className="text-[#0d3822]" />,
      };
    }
    if (code >= 45 && code <= 48) {
      return {
        text_ur: "دھند و کہر",
        text_en: "Foggy",
        icon: <Cloud size={36} className="text-gray-500" />,
      };
    }
    if (code >= 51 && code <= 67) {
      return {
        text_ur: "بارش کا امکان",
        text_en: "Rainy",
        icon: <CloudRain size={36} className="text-blue-600" />,
      };
    }
    return {
      text_ur: "ابر آلود",
      text_en: "Overcast",
      icon: <Cloud size={36} className="text-gray-500" />,
    };
  };

  const weatherInfo = getWeatherInfo(weather.code);

  return (
    <div
      className={`bg-white border border-[#dcd8cd] rounded-none shadow-2xs font-sans overflow-hidden ${className}`}
      dir={dir}
    >
      {/* Unified Forest Green Header matching Daily Insaaf Broadsheet Style */}
      <div className="bg-[#0d3822] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-[#072415]">
        <div className="flex items-center gap-1.5">
          <CloudSun size={16} className="text-yellow-400" />
          <h3 className={`font-bold text-sm text-white ${isUrdu ? "urdu-headline text-[15px]" : "font-sans"}`}>
            {isUrdu ? "موسم و درجۂ حرارت" : "Weather & Forecast"}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-emerald-200 font-sans">
          <Clock size={11} />
          <span>{timestamp}</span>
        </div>
      </div>

      {/* City Switcher Row (Matching Namaz & Currency Widgets) */}
      <div className="px-3.5 py-2 bg-[#f7f6f3] border-b border-[#dcd8cd] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-700 font-medium">
          <MapPin size={13} className="text-[#0d3822]" />
          <span>{isUrdu ? "شہر:" : "City:"}</span>
        </div>
        <select
          value={selectedCity.id}
          onChange={(e) => {
            const found = CITIES.find((c) => c.id === e.target.value);
            if (found) setSelectedCity(found);
          }}
          className="text-xs bg-white border border-[#dcd8cd] rounded-none px-2 py-1 text-gray-900 font-medium focus:outline-none focus:border-[#0d3822] cursor-pointer font-sans"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {isUrdu ? c.name_ur : c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Main Temperature & Condition Display */}
        <div className="flex items-center justify-between px-1">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-950 font-sans tracking-tight">
              {weather.temp}°C
            </div>
            <div className="text-xs font-semibold text-gray-600 mt-0.5">
              {isUrdu ? selectedCity.name_ur : selectedCity.name_en}
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            {weatherInfo.icon}
            <span className={`text-xs font-bold text-gray-800 mt-1 ${isUrdu ? "urdu-body text-[13px]" : "font-sans"}`}>
              {isUrdu ? weatherInfo.text_ur : weatherInfo.text_en}
            </span>
          </div>
        </div>

        {/* 3-Column Metric Grid (Matching Broadsheet Sharp Box Geometry) */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#dcd8cd] border border-[#dcd8cd] rounded-none bg-[#f7f6f3] text-center py-2.5 px-1 text-xs">
          {/* Feels Like */}
          <div className="px-1">
            <div className="text-[10px] text-gray-600 font-medium mb-0.5 flex items-center justify-center gap-1">
              <Thermometer size={11} className="text-[#0d3822]" />
              <span>{isUrdu ? "محسوس" : "Feels"}</span>
            </div>
            <div className="font-extrabold text-gray-950 font-sans text-xs sm:text-[13px]">
              {weather.apparent}°C
            </div>
          </div>

          {/* Humidity */}
          <div className="px-1">
            <div className="text-[10px] text-gray-600 font-medium mb-0.5 flex items-center justify-center gap-1">
              <Droplets size={11} className="text-[#0d3822]" />
              <span>{isUrdu ? "نمی" : "Humidity"}</span>
            </div>
            <div className="font-extrabold text-gray-950 font-sans text-xs sm:text-[13px]">
              {weather.humidity}%
            </div>
          </div>

          {/* Wind Speed */}
          <div className="px-1">
            <div className="text-[10px] text-gray-600 font-medium mb-0.5 flex items-center justify-center gap-1">
              <Wind size={11} className="text-[#0d3822]" />
              <span>{isUrdu ? "ہوا" : "Wind"}</span>
            </div>
            <div className="font-extrabold text-gray-950 font-sans text-xs sm:text-[13px]">
              {weather.wind} <span className="text-[9px] font-normal text-gray-500">km/h</span>
            </div>
          </div>
        </div>

        {/* Source citation */}
        <p className="text-[10px] text-gray-500 text-center font-sans leading-tight">
          {isUrdu ? "موسمی ڈیٹا: اوپن میٹیو لائیو سیٹلائٹ فیڈ" : "Weather Data: Open-Meteo Satellite Feed"}
        </p>
      </div>
    </div>
  );
}
