"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Bell, Save, Check, Loader2, Info } from "lucide-react";

const cellKey = (activityType, role) => `${activityType}:${role}`;

function formatDateTime(dt) {
  if (!dt) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dt));
}

export default function NotificationsAdminPage() {
  const [matrix, setMatrix] = useState(null);
  const [draftCells, setDraftCells] = useState(new Map());
  const [savedCells, setSavedCells] = useState(new Map());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [prefsRes, logRes] = await Promise.all([
          fetch("/api/notifications/prefs").then((r) => r.json()),
          fetch("/api/notifications/log?limit=25").then((r) => r.json()),
        ]);

        if (!active) return;
        if (!prefsRes?.activities) throw new Error(prefsRes?.error || "Could not load alert settings");

        const map = new Map();
        for (const act of prefsRes.activities) {
          for (const cell of act.cells) {
            map.set(cellKey(act.activityType, cell.role), {
              emailEnabled: cell.emailEnabled,
              priority: cell.priority,
            });
          }
        }

        setMatrix({ roles: prefsRes.roles || [], activities: prefsRes.activities || [] });
        setDraftCells(map);
        setSavedCells(new Map([...map].map(([k, v]) => [k, { ...v }])));
        setLogs(logRes?.logs || []);
      } catch (err) {
        if (active) showToast(err.message || "Could not load alert settings", "error");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (draftCells.size !== savedCells.size) return true;
    for (const [k, v] of draftCells) {
      const s = savedCells.get(k);
      if (!s || s.emailEnabled !== v.emailEnabled || s.priority !== v.priority) return true;
    }
    return false;
  }, [draftCells, savedCells]);

  function updateCell(activityType, role, patch) {
    setDraftCells((prev) => {
      const next = new Map(prev);
      const k = cellKey(activityType, role);
      const cur = next.get(k) || { emailEnabled: false, priority: 100 };
      next.set(k, { ...cur, ...patch });
      return next;
    });
  }

  function toggleAllRolesForActivity(act, enable) {
    setDraftCells((prev) => {
      const next = new Map(prev);
      for (const cell of act.cells) {
        const k = cellKey(act.activityType, cell.role);
        const cur = next.get(k) || { emailEnabled: false, priority: act.defaultPriority };
        next.set(k, { ...cur, emailEnabled: enable });
      }
      return next;
    });
  }

  async function handleSave() {
    if (!matrix) return;
    setSaving(true);
    try {
      const prefs = [];
      for (const act of matrix.activities) {
        for (const cell of act.cells) {
          const val = draftCells.get(cellKey(act.activityType, cell.role));
          if (val) {
            prefs.push({
              role: cell.role,
              activityType: act.activityType,
              emailEnabled: val.emailEnabled,
              priority: val.priority,
            });
          }
        }
      }

      const res = await fetch("/api/notifications/prefs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefs }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Save failed");
      }

      setSavedCells(new Map([...draftCells].map(([k, v]) => [k, { ...v }])));
      showToast("Saved alert preferences", "success");
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-sm text-[#5c635b]">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading alert settings...
      </div>
    );
  }

  if (!matrix) {
    return (
      <div className="bg-white border border-[#e5e2da] p-12 text-center text-sm text-[#5c635b]">
        Could not load the alert matrix.
      </div>
    );
  }

  const groupedActivities = [];
  for (const act of matrix.activities) {
    let grp = groupedActivities.find((g) => g.group === act.group);
    if (!grp) {
      grp = { group: act.group, items: [] };
      groupedActivities.push(grp);
    }
    grp.items.push(act);
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-semibold shadow-lg border flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-[#0a2618] text-white border-[#1f5637]"
          }`}
        >
          {toast.type !== "error" && <Check size={14} className="text-emerald-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#e5e2da] pb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18221b] flex items-center gap-2">
            <Bell className="text-[#184e2d]" size={24} />
            <span>Email alerts</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5c635b] mt-0.5">
            On every crucial activity, email the chosen roles. Toggle each activity per role and set its priority — lower number = sent first / higher importance.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition ${
            hasChanges
              ? "bg-[#184e2d] hover:bg-[#0a2618] text-white cursor-pointer"
              : "bg-[#e5e2da] text-[#5c635b] cursor-not-allowed"
          }`}
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          <span>{saving ? "Saving..." : hasChanges ? "Save changes" : "Saved"}</span>
        </button>
      </div>

      {/* Info Banner */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-900 flex items-start gap-2">
        <Info size={15} className="shrink-0 mt-0.5 text-blue-700" />
        <span>
          By default <strong>Super Admin</strong> and <strong>Editor-in-Chief</strong> receive every alert.
          Delivery uses SMTP when <code className="font-mono">SMTP_HOST/PORT/USER/PASS/FROM</code> or Settings → Email (SMTP) are configured; otherwise every alert is logged below so nothing is lost in dev.
        </span>
      </div>

      {/* Grouped Activity × Role Matrix */}
      <div className="space-y-6">
        {groupedActivities.map(({ group, items }) => (
          <div key={group} className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
            <header className="border-b border-[#e5e2da] px-5 py-3 bg-[#fbfaf8]">
              <h3 className="text-sm font-bold text-[#18221b]">{group}</h3>
            </header>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#e5e2da] text-left bg-white">
                    <th className="px-4 py-2.5 text-xs font-semibold text-[#18221b] min-w-[240px]">
                      Activity
                    </th>
                    {matrix.roles.map((r) => (
                      <th key={r.key} className="px-3 py-2.5 text-center text-xs font-semibold text-[#18221b]">
                        <span className="block">{r.nameEn}</span>
                        <span className="font-mono block text-[10px] font-normal text-[#5c635b]">
                          {r.key}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e2da]">
                  {items.map((act) => {
                    const anyOn = act.cells.some(
                      (c) => draftCells.get(cellKey(act.activityType, c.role))?.emailEnabled
                    );

                    return (
                      <tr key={act.activityType} className="align-top hover:bg-[#fbfaf8]/60">
                        <td className="px-4 py-3">
                          <span className="block font-medium text-[#18221b] text-xs sm:text-sm">
                            {act.label}
                          </span>
                          <span className="block text-xs text-[#5c635b] mt-0.5">
                            {act.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleAllRolesForActivity(act, !anyOn)}
                            className="mt-1 text-[11px] font-semibold text-[#184e2d] hover:text-[#0a2618] cursor-pointer"
                          >
                            {anyOn ? "Turn off for all roles" : "Turn on for all roles"}
                          </button>
                        </td>

                        {matrix.roles.map((r) => {
                          const cell = draftCells.get(cellKey(act.activityType, r.key)) || {
                            emailEnabled: false,
                            priority: act.defaultPriority,
                          };

                          return (
                            <td key={r.key} className="px-3 py-3 text-center">
                              <div className="flex flex-col items-center gap-1.5">
                                <input
                                  type="checkbox"
                                  checked={cell.emailEnabled}
                                  onChange={(e) =>
                                    updateCell(act.activityType, r.key, {
                                      emailEnabled: e.target.checked,
                                    })
                                  }
                                  aria-label={`${act.label} for ${r.key}`}
                                  className="size-4 accent-[#184e2d] cursor-pointer"
                                />
                                <input
                                  type="number"
                                  min={0}
                                  max={1000}
                                  value={cell.priority}
                                  disabled={!cell.emailEnabled}
                                  onChange={(e) =>
                                    updateCell(act.activityType, r.key, {
                                      priority: Number(e.target.value) || 0,
                                    })
                                  }
                                  title="Priority — lower number = sent first"
                                  className="w-14 rounded border border-[#e5e2da] bg-white px-1.5 py-1 text-center text-xs outline-none focus:border-[#184e2d] disabled:bg-[#f9f8f5] disabled:text-gray-400"
                                />
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Alerts Audit Log */}
      <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
        <header className="flex items-center justify-between gap-3 border-b border-[#e5e2da] px-5 py-3 bg-[#fbfaf8]">
          <h3 className="text-sm font-bold text-[#18221b]">Recent alerts</h3>
          <span className="text-xs text-[#5c635b]">Last {logs.length} email(s) the system fired</span>
        </header>

        {logs.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#18221b]">No alerts yet</p>
            <p className="text-xs text-[#5c635b] mt-1">
              When a crucial activity happens, the emails it sends will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#e5e2da] text-left text-xs text-[#5c635b]">
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Activity</th>
                  <th className="px-4 py-2 font-medium">Recipient</th>
                  <th className="px-4 py-2 font-medium">Subject</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e2da]">
                {logs.map((entry) => (
                  <tr key={entry.id}>
                    <td className="whitespace-nowrap px-4 py-2 text-xs text-[#5c635b]">
                      {formatDateTime(entry.createdAt)}
                    </td>
                    <td className="font-mono px-4 py-2 text-[11px] text-[#18221b]">
                      {entry.activityType}
                    </td>
                    <td className="px-4 py-2 text-xs text-[#18221b]">{entry.recipient}</td>
                    <td className="max-w-xs truncate px-4 py-2 text-xs text-[#5c635b]" title={entry.subject}>
                      {entry.subject}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded ${
                          entry.status === "sent"
                            ? "bg-emerald-50 text-[#184e2d]"
                            : entry.status === "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {entry.status}
                        {entry.mode === "log" ? " · log" : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
