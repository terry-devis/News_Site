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
          const timeStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + ", " +
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

  // Decode WMO code into Urdu/English description & icon
  const getWeatherInfo = (code) => {
    if (code === 0) {
      return {
        text_ur: "صاف",
        text_en: "Clear Sky",
        icon: <Sun size={38} className="text-amber-500 animate-spin-slow" />,
      };
    }
    if (code >= 1 && code <= 3) {
      return {
        text_ur: "جزوی ابر آلود",
        text_en: "Partly Cloudy",
        icon: <CloudSun size={38} className="text-amber-500" />,
      };
    }
    if (code >= 45 && code <= 48) {
      return {
        text_ur: "دھند",
        text_en: "Foggy",
        icon: <Cloud size={38} className="text-gray-400" />,
      };
    }
    if (code >= 51 && code <= 67) {
      return {
        text_ur: "بارش",
        text_en: "Rainy",
        icon: <CloudRain size={38} className="text-blue-500" />,
      };
    }
    return {
      text_ur: "ابر آلود",
      text_en: "Overcast",
      icon: <Cloud size={38} className="text-gray-400" />,
    };
  };

  const weatherInfo = getWeatherInfo(weather.code);

  return (
    <div
      className={`bg-white border border-[#dcd8cd] rounded shadow-2xs font-sans overflow-hidden ${className}`}
      dir={dir}
    >
      {/* Header Bar matching Daily Insaaf */}
      <div className="p-3.5 border-b border-[#eceae3] flex items-center justify-between bg-[#fbfbfa]">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <CloudSun size={17} className="text-emerald-700" />
          <h3 className={`font-bold text-sm text-gray-900 ${isUrdu ? "urdu-headline text-[15px]" : "font-sans"}`}>
            {isUrdu ? "موسم" : "Weather"}
          </h3>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-sans">
          <Clock size={11} />
          <span>{timestamp}</span>
        </div>
      </div>

      {/* City Switcher Row */}
      <div className="px-3.5 py-2 bg-[#f7f6f3] border-b border-[#eceae3] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-600 font-medium">
          <MapPin size={13} className="text-emerald-700" />
          <span>{isUrdu ? "شہر:" : "City:"}</span>
        </div>
        <select
          value={selectedCity.id}
          onChange={(e) => {
            const found = CITIES.find((c) => c.id === e.target.value);
            if (found) setSelectedCity(found);
          }}
          className="text-xs bg-white border border-[#dcd8cd] rounded px-2 py-0.5 text-gray-800 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {isUrdu ? c.name_ur : c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3.5">
        {/* Main Temperature & Visual Display */}
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-950 font-sans tracking-tight">
              {weather.temp}°C
            </div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">
              {isUrdu ? selectedCity.name_ur : selectedCity.name_en}
            </div>
          </div>

          <div className="text-center flex flex-col items-center">
            {weatherInfo.icon}
            <span className={`text-xs font-bold text-gray-700 mt-1 ${isUrdu ? "urdu-body text-[13px]" : "font-sans"}`}>
              {isUrdu ? weatherInfo.text_ur : weatherInfo.text_en}
            </span>
          </div>
        </div>

        {/* 3-Column Metric Grid matching Daily Insaaf */}
        <div className="grid grid-cols-3 divide-x divide-x-reverse divide-[#eceae3] border border-[#eceae3] rounded bg-[#fbfbfa] text-center py-2 px-1 text-xs">
          {/* Feels Like */}
          <div className="px-1">
            <div className="text-[10px] text-gray-500 font-medium mb-0.5 flex items-center justify-center gap-0.5">
              <Thermometer size={10} className="text-amber-600" />
              <span>{isUrdu ? "محسوس" : "Feels"}</span>
            </div>
            <div className="font-extrabold text-gray-900 font-sans text-xs sm:text-[13px]">
              {weather.apparent}°
            </div>
          </div>

          {/* Humidity */}
          <div className="px-1">
            <div className="text-[10px] text-gray-500 font-medium mb-0.5 flex items-center justify-center gap-0.5">
              <Droplets size={10} className="text-blue-500" />
              <span>{isUrdu ? "نمی" : "Humidity"}</span>
            </div>
            <div className="font-extrabold text-gray-900 font-sans text-xs sm:text-[13px]">
              {weather.humidity}%
            </div>
          </div>

          {/* Wind Speed */}
          <div className="px-1">
            <div className="text-[10px] text-gray-500 font-medium mb-0.5 flex items-center justify-center gap-0.5">
              <Wind size={10} className="text-emerald-600" />
              <span>{isUrdu ? "ہوا" : "Wind"}</span>
            </div>
            <div className="font-extrabold text-gray-900 font-sans text-xs sm:text-[13px]">
              {weather.wind} <span className="text-[9px] font-normal text-gray-500">km/h</span>
            </div>
          </div>
        </div>

        {/* Source citation */}
        <p className="text-[10px] text-gray-400 text-center mt-2.5 font-sans">
          {isUrdu ? "موسمی ڈیٹا: اوپن میٹیو (Open-Meteo)" : "Weather Data: Open-Meteo"}
        </p>
      </div>
    </div>
  );
}
