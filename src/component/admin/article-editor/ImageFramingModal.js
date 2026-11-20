"use client";

import React, { useState, useEffect } from "react";
import { X, Crosshair, Crop, RotateCcw, Check } from "lucide-react";

const ASPECT_PRESETS = [
  { key: "16:9", label: "Hero 16:9", ratio: 16 / 9, hint: "Lead story, video and wide cards." },
  { key: "4:3", label: "Card 4:3", ratio: 4 / 3, hint: "Section cards and 3:2 tiles." },
  { key: "1:1", label: "Square", ratio: 1, hint: "Rails, lists and thumbnails." },
  { key: "3:4", label: "Portrait", ratio: 3 / 4, hint: "Vertical cards and e-paper promos." },
  { key: "og", label: "Social share", ratio: 1200 / 630, hint: "WhatsApp, Facebook and X previews (1200×630)." },
];

export default function ImageFramingModal({ open, imageUrl, initialFraming, onClose, onSave }) {
  const [tab, setTab] = useState("focal"); // 'focal' | 'crops'
  const [focal, setFocal] = useState({ x: 50, y: 50 });
  const [activeAspect, setActiveAspect] = useState("16:9");
  const [crops, setCrops] = useState({});

  useEffect(() => {
    if (!open) return;
    setFocal(initialFraming?.focal || { x: 50, y: 50 });
    setCrops(initialFraming?.crops || {});
    setTab("focal");
  }, [open, initialFraming]);

  if (!open || !imageUrl) return null;

  const currentCrop = crops[activeAspect] || { zoom: 1, x: 50, y: 50 };
  const currentPreset = ASPECT_PRESETS.find((p) => p.key === activeAspect) || ASPECT_PRESETS[0];

  function handleFocalClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocal({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }

  function updateCrop(field, value) {
    setCrops((prev) => ({
      ...prev,
      [activeAspect]: {
        zoom: currentCrop.zoom,
        x: currentCrop.x,
        y: currentCrop.y,
        [field]: value,
      },
    }));
  }

  function handleReset() {
    if (tab === "focal") {
      setFocal({ x: 50, y: 50 });
    } else {
      setCrops((prev) => {
        const next = { ...prev };
        delete next[activeAspect];
        return next;
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e2da] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <header className="px-5 py-3.5 border-b border-[#e5e2da] bg-[#fbfaf8] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#18221b]">Image framing & cropping</h3>
            <p className="text-[11px] text-[#5c635b]">
              Set the focal point and aspect-ratio crops so every card keeps the subject in frame.
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={18} />
          </button>
        </header>

        {/* Mode Tabs */}
        <div className="px-5 pt-3 border-b border-[#e5e2da] flex items-center justify-between bg-white">
          <div className="flex gap-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTab("focal")}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                tab === "focal"
                  ? "border-[#184e2d] text-[#184e2d]"
                  : "border-transparent text-[#5c635b] hover:text-[#18221b]"
              }`}
            >
              <Crosshair size={14} />
              <span>Focal point</span>
            </button>
            <button
              type="button"
              onClick={() => setTab("crops")}
              className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
                tab === "crops"
                  ? "border-[#184e2d] text-[#184e2d]"
                  : "border-transparent text-[#5c635b] hover:text-[#18221b]"
              }`}
            >
              <Crop size={14} />
              <span>Aspect crops (5)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="mb-2 text-[11px] font-semibold text-[#5c635b] hover:text-[#18221b] flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === "focal" ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
              <div>
                <p className="text-xs text-[#5c635b] mb-2">
                  Click anywhere on the image to set the focal point ({focal.x}%, {focal.y}%).
                </p>
                <div
                  onClick={handleFocalClick}
                  className="relative border border-[#e5e2da] bg-gray-900 cursor-crosshair overflow-hidden select-none"
                >
                  <img src={imageUrl} alt="Focal target" className="w-full max-h-[420px] object-contain mx-auto" />
                  <div
                    style={{ left: `${focal.x}%`, top: `${focal.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div className="size-8 rounded-full border-2 border-white shadow-lg bg-[#184e2d]/50 flex items-center justify-center">
                      <div className="size-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Multi-Ratio Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#5c635b]">
                  Live card previews
                </h4>
                {ASPECT_PRESETS.slice(0, 4).map((p) => (
                  <div key={p.key} className="border border-[#e5e2da] p-2 bg-[#fbfaf8]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-[#18221b]">{p.label}</span>
                      <span className="font-mono text-[#5c635b]">{p.key}</span>
                    </div>
                    <div style={{ aspectRatio: p.ratio }} className="w-full overflow-hidden bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={p.label}
                        style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 items-start">
              {/* Aspect Preset Selector */}
              <div className="space-y-1.5">
                {ASPECT_PRESETS.map((p) => {
                  const hasCustom = Boolean(crops[p.key]);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setActiveAspect(p.key)}
                      className={`w-full text-left p-2.5 border transition cursor-pointer ${
                        activeAspect === p.key
                          ? "bg-[#eef5f0] border-[#184e2d]"
                          : "bg-white border-[#e5e2da] hover:bg-[#fbfaf8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#18221b]">{p.label}</span>
                        {hasCustom && (
                          <span className="text-[10px] font-semibold bg-[#184e2d] text-white px-1.5 py-0.5 rounded">
                            Custom
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#5c635b] mt-0.5">{p.hint}</p>
                    </button>
                  );
                })}
              </div>

              {/* Cropper Canvas + Sliders */}
              <div className="space-y-4">
                <div className="bg-[#18221b] p-4 flex items-center justify-center border border-[#e5e2da]">
                  <div
                    style={{ aspectRatio: currentPreset.ratio }}
                    className="w-full max-w-lg overflow-hidden border-2 border-emerald-400 shadow-lg bg-black"
                  >
                    <img
                      src={imageUrl}
                      alt={currentPreset.label}
                      style={{
                        objectPosition: `${currentCrop.x}% ${currentCrop.y}%`,
                        transform: `scale(${currentCrop.zoom})`,
                        transformOrigin: `${currentCrop.x}% ${currentCrop.y}%`,
                      }}
                      className="w-full h-full object-cover transition-transform duration-75"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#fbfaf8] border border-[#e5e2da] p-3.5">
                  <div>
                    <label className="flex justify-between text-[11px] font-semibold text-[#18221b] mb-1">
                      <span>Zoom</span>
                      <span className="font-mono">{Number(currentCrop.zoom).toFixed(1)}×</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.1"
                      value={currentCrop.zoom}
                      onChange={(e) => updateCrop("zoom", Number(e.target.value))}
                      className="w-full accent-[#184e2d]"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-[11px] font-semibold text-[#18221b] mb-1">
                      <span>Horizontal</span>
                      <span className="font-mono">{currentCrop.x}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentCrop.x}
                      onChange={(e) => updateCrop("x", Number(e.target.value))}
                      className="w-full accent-[#184e2d]"
                    />
                  </div>
                  <div>
                    <label className="flex justify-between text-[11px] font-semibold text-[#18221b] mb-1">
                      <span>Vertical</span>
                      <span className="font-mono">{currentCrop.y}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentCrop.y}
                      onChange={(e) => updateCrop("y", Number(e.target.value))}
                      className="w-full accent-[#184e2d]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-5 py-3 border-t border-[#e5e2da] bg-[#fbfaf8] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ focal, crops });
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#184e2d] hover:bg-[#0a2618] text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} />
            <span>Save framing</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
