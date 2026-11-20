"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ShieldCheck, Plus, Save, Check, Loader2, X, Info } from "lucide-react";

export default function RolesAdminPage() {
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [groupLabels, setGroupLabels] = useState({});
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [draftPerms, setDraftPerms] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Create custom role modal state
  const [showNewModal, setShowNewModal] = useState(false);
  const [newRoleNameEn, setNewRoleNameEn] = useState("");
  const [newRoleNameUr, setNewRoleNameUr] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/roles");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not load roles");
        if (!active) return;

        const loadedRoles = data.roles || [];
        const groups = data.permissionGroups || {};
        setRoles(loadedRoles);
        setPermissionGroups(groups);
        setGroupLabels(data.groupLabels || {});

        const allKeys = Object.values(groups).flat().map((p) => p.key);
        const initial = loadedRoles.find((r) => r.key !== "super_admin") || loadedRoles[0];
        if (initial) {
          setSelectedRoleId(initial.id);
          setDraftPerms(
            new Set(initial.key === "super_admin" ? allKeys : initial.permissions || [])
          );
        }
      } catch (err) {
        if (active) showToast(err.message || "Could not load roles", "error");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const allPermissionKeys = useMemo(
    () => Object.values(permissionGroups).flat().map((p) => p.key),
    [permissionGroups]
  );

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  );

  const isSuperAdmin = selectedRole?.key === "super_admin";

  function selectRole(role) {
    setSelectedRoleId(role.id);
    setDraftPerms(
      new Set(role.key === "super_admin" ? allPermissionKeys : role.permissions || [])
    );
  }

  const hasChanges = useMemo(() => {
    if (!selectedRole || isSuperAdmin) return false;
    const saved = new Set(selectedRole.permissions || []);
    if (saved.size !== draftPerms.size) return true;
    for (const k of draftPerms) {
      if (!saved.has(k)) return true;
    }
    return false;
  }, [selectedRole, draftPerms, isSuperAdmin]);

  function togglePermission(key) {
    if (isSuperAdmin) return;
    setDraftPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleGroup(groupKeys, shouldSelectAll) {
    if (isSuperAdmin) return;
    setDraftPerms((prev) => {
      const next = new Set(prev);
      for (const k of groupKeys) {
        if (shouldSelectAll) next.add(k);
        else next.delete(k);
      }
      return next;
    });
  }

  async function handleSave() {
    if (!selectedRole || isSuperAdmin) return;
    setSaving(true);
    try {
      const permissionKeys = Array.from(draftPerms);
      const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKeys }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setRoles((prev) =>
        prev.map((r) => (r.id === selectedRole.id ? { ...r, permissions: permissionKeys } : r))
      );
      showToast(`Saved ${selectedRole.nameEn}'s permissions`, "success");
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateRole(e) {
    e.preventDefault();
    if (!newRoleNameEn.trim()) return;
    setCreatingRole(true);
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newRoleNameEn,
          nameUr: newRoleNameUr,
          description: newRoleDesc,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create role");

      const created = { ...data.role, userCount: 0 };
      setRoles((prev) => [...prev, created]);
      selectRole(created);
      setShowNewModal(false);
      setNewRoleNameEn("");
      setNewRoleNameUr("");
      setNewRoleDesc("");
      showToast(`Created role "${created.nameEn}"`, "success");
    } catch (err) {
      showToast(err.message || "Failed to create role", "error");
    } finally {
      setCreatingRole(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-[#5c635b]">
        <Loader2 className="animate-spin mr-2" size={20} />
        <span className="text-sm">Loading roles & permissions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <ShieldCheck className="text-[#184e2d]" size={24} />
            <span>Roles & access</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5c635b] mt-0.5">
            Roles are just sets of permissions — edit them here, no code or deploy needed.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowNewModal(true)}
            className="px-3 py-2 text-xs font-semibold border border-[#e5e2da] bg-white hover:bg-gray-50 text-[#18221b] flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>New role</span>
          </button>

          {selectedRole && !isSuperAdmin && (
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
          )}
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Left Role List */}
        <div className="bg-white border border-[#e5e2da] h-fit shadow-2xs">
          <ul className="divide-y divide-[#e5e2da]">
            {roles.map((role) => {
              const active = role.id === selectedRoleId;
              const isSuper = role.key === "super_admin";
              return (
                <li key={role.id}>
                  <button
                    type="button"
                    onClick={() => selectRole(role)}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition cursor-pointer ${
                      active ? "bg-[#eef5f0] border-l-3 border-l-[#184e2d]" : "hover:bg-[#fbfaf8]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#18221b]">
                        {role.nameEn}
                      </span>
                      <span className="font-mono block text-[11px] text-[#5c635b]">
                        {role.key}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[11px] font-medium text-[#5c635b]">
                        {isSuper ? "all" : (role.permissions || []).length} perms
                      </span>
                      <span className="block text-[11px] text-gray-400">
                        {role.userCount || 0} {role.userCount === 1 ? "user" : "users"}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Permission Matrix */}
        {selectedRole ? (
          <div className="space-y-4">
            {/* Role Summary Card */}
            <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-[#18221b]">{selectedRole.nameEn}</h2>
                    {selectedRole.nameUr && (
                      <span className="text-base text-[#5c635b] font-medium" dir="rtl">
                        {selectedRole.nameUr}
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        selectedRole.isSystem
                          ? "bg-blue-50 text-blue-700"
                          : "bg-emerald-50 text-[#184e2d]"
                      }`}
                    >
                      {selectedRole.isSystem ? "System" : "Custom"}
                    </span>
                  </div>
                  {selectedRole.description && (
                    <p className="mt-1 max-w-2xl text-xs sm:text-sm text-[#5c635b]">
                      {selectedRole.description}
                    </p>
                  )}
                </div>

                <div className="text-right text-sm">
                  <span className="block font-bold text-[#18221b]">
                    {isSuperAdmin ? allPermissionKeys.length : draftPerms.size}{" "}
                    <span className="font-normal text-[#5c635b]">/ {allPermissionKeys.length}</span>
                  </span>
                  <span className="text-xs text-[#5c635b]">permissions granted</span>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="mt-3 rounded bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-blue-800 flex items-center gap-2">
                  <Info size={14} className="shrink-0" />
                  <span>The Super Admin role always has every permission and can&apos;t be edited.</span>
                </div>
              )}
            </div>

            {/* Grouped Permission Cards */}
            {Object.entries(permissionGroups).map(([groupKey, items]) => {
              const keys = items.map((i) => i.key);
              const grantedCount = keys.filter((k) => draftPerms.has(k)).length;
              const allSelected = grantedCount === keys.length;
              const groupTitle =
                groupLabels[groupKey] ||
                groupKey.charAt(0).toUpperCase() + groupKey.slice(1).replace(/[-_]/g, " ");

              return (
                <div key={groupKey} className="bg-white border border-[#e5e2da] shadow-2xs">
                  <header className="flex items-center justify-between gap-3 border-b border-[#e5e2da] px-5 py-3 bg-[#fbfaf8]">
                    <h3 className="text-sm font-bold text-[#18221b]">
                      {groupTitle}
                      <span className="ml-2 text-xs font-normal text-[#5c635b]">
                        {grantedCount}/{keys.length}
                      </span>
                    </h3>
                    {!isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => toggleGroup(keys, !allSelected)}
                        className="text-xs font-semibold text-[#184e2d] hover:text-[#0a2618] transition cursor-pointer"
                      >
                        {allSelected ? "Clear all" : "Select all"}
                      </button>
                    )}
                  </header>

                  <ul className="grid grid-cols-1 gap-x-6 gap-y-1 p-4 sm:grid-cols-2">
                    {items.map((perm) => {
                      const checked = draftPerms.has(perm.key);
                      return (
                        <li key={perm.key}>
                          <label
                            className={`flex items-start gap-2.5 rounded px-2 py-1.5 text-sm transition ${
                              isSuperAdmin ? "opacity-75" : "cursor-pointer hover:bg-[#f9f8f5]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={isSuperAdmin}
                              onChange={() => togglePermission(perm.key)}
                              className="mt-0.5 size-4 shrink-0 accent-[#184e2d]"
                            />
                            <span className="min-w-0">
                              <span className="font-mono block text-[12px] font-medium text-[#18221b]">
                                {perm.key}
                              </span>
                              <span className="block text-xs text-[#5c635b]">
                                {perm.description}
                              </span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#e5e2da] p-12 text-center text-sm text-[#5c635b]">
            Pick a role on the left to edit its access.
          </div>
        )}
      </div>

      {/* Create Custom Role Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-xl">
            <div className="px-5 py-3.5 border-b border-[#e5e2da] flex items-center justify-between bg-[#fbfaf8]">
              <h3 className="text-sm font-bold text-[#18221b]">Create Custom Role</h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreateRole} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Role Name (English) *
                </label>
                <input
                  type="text"
                  required
                  value={newRoleNameEn}
                  onChange={(e) => setNewRoleNameEn(e.target.value)}
                  placeholder="e.g. Desk Coordinator"
                  className="w-full px-3 py-2 text-sm border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Role Name (Urdu)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={newRoleNameUr}
                  onChange={(e) => setNewRoleNameUr(e.target.value)}
                  placeholder="مثلاً ڈیسک کوآرڈینیٹر"
                  className="w-full px-3 py-2 text-sm border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="What can this role do?"
                  className="w-full px-3 py-2 text-sm border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-2 text-xs font-semibold border border-[#e5e2da] text-[#5c635b] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingRole}
                  className="px-4 py-2 text-xs font-semibold bg-[#184e2d] hover:bg-[#0a2618] text-white disabled:opacity-60"
                >
                  {creatingRole ? "Creating..." : "Create role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
