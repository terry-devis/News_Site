"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Pencil, X, AlertTriangle, Check, Search, Users, ShieldCheck, UserCheck, KeyRound } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

const FALLBACK_SECTIONS = [
  "Pakistan",
  "World",
  "Sports",
  "Business",
  "Entertainment",
  "Science & Technology",
  "Health",
  "Lifestyle",
  "Crime",
  "Religion",
  "Opinion",
  "Blogs",
  "Fact Check",
  "Weird News",
  "Videos",
  "Special Reports",
];

const URDU_INPUT_CLASS =
  "w-full rounded-md border border-[#e5e2da] px-3 py-2.5 text-[15px] leading-[1.9] text-gray-900 font-nastaliq text-right focus:outline-emerald-800 bg-white";
const URDU_TEXTAREA_CLASS =
  "w-full rounded-md border border-[#e5e2da] px-3 py-2.5 text-[15px] leading-[2.15] text-gray-900 font-nastaliq text-right focus:outline-emerald-800 bg-white min-h-[108px]";
const EN_INPUT_CLASS =
  "w-full rounded-md border border-[#e5e2da] px-3 py-2.5 text-xs text-gray-900 focus:outline-emerald-800 bg-white";
const EN_TEXTAREA_CLASS =
  "w-full rounded-md border border-[#e5e2da] px-3 py-2.5 text-xs leading-relaxed text-gray-900 focus:outline-emerald-800 bg-white min-h-[108px]";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [deskSections, setDeskSections] = useState(FALLBACK_SECTIONS);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Modals
  const [newUserModalOpen, setNewUserModalOpen] = useState(false);
  const [editUserModal, setEditUserModal] = useState(null); // user object or null
  const [passwordModal, setPasswordModal] = useState(null); // user object or null

  // New user form state
  const initialNewUser = {
    email: "",
    starting_password: "",
    full_name_ur: "",
    full_name_en: "",
    byline_name: "",
    designation_ur: "",
    designation_en: "",
    bio_ur: "",
    bio_en: "",
    roles: ["Reporter"],
    desk_scope: [],
    is_public_author: true,
  };
  const [newUserForm, setNewUserForm] = useState(initialNewUser);
  const [newPasswordValue, setNewPasswordValue] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, catsRes, meRes] = await Promise.all([
        fetch("/api/users", { cache: "no-store" }),
        fetch("/api/roles", { cache: "no-store" }).catch(() => null),
        fetch("/api/categories").catch(() => null),
        fetch("/api/auth/me", { cache: "no-store" }).catch(() => null),
      ]);

      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users || []);
      }

      if (rolesRes && rolesRes.ok) {
        const rolesData = await rolesRes.json();
        if (rolesData.roles) setRolesList(rolesData.roles);
      }

      if (catsRes && catsRes.ok) {
        const catsData = await catsRes.json();
        const cats = catsData.categories || catsData.data || (Array.isArray(catsData) ? catsData : []);
        const names = cats.map((c) => c.name_en || c.name_ur || c.slug).filter(Boolean);
        if (names.length > 0) setDeskSections(names);
      }

      if (meRes && meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) setCurrentUser(meData.user);
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const canManageUsers = !currentUser || hasPermission(currentUser, "user.manage");
  const canResetPassword = !currentUser || hasPermission(currentUser, "user.reset_password");

  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        String(u.email || "").toLowerCase().includes(q) ||
        String(u.full_name_en || "").toLowerCase().includes(q) ||
        String(u.full_name_ur || "").toLowerCase().includes(q) ||
        String(u.designation_en || "").toLowerCase().includes(q) ||
        (u.roles || []).some((r) => String(r).toLowerCase().includes(q));

      const matchesRole =
        roleFilter === "all" ||
        (u.roles || []).some(
          (r) => String(r).toLowerCase() === String(roleFilter).toLowerCase()
        );

      const userStatus = (u.status || "Active").toLowerCase();
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? userStatus === "active" : userStatus !== "active");

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const activeUsersCount = useMemo(
    () => users.filter((u) => (u.status || "Active").toLowerCase() === "active").length,
    [users]
  );
  const inactiveUsersCount = users.length - activeUsersCount;

  // Create User Handler
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.email) {
      showToast("Email is required", "error");
      return;
    }
    if (!newUserForm.starting_password || newUserForm.starting_password.length < 10) {
      showToast("Password must be at least 10 characters", "error");
      return;
    }
    if (!newUserForm.full_name_ur) {
      showToast("Full name (Urdu) is required", "error");
      return;
    }
    if (newUserForm.roles.length === 0) {
      showToast("Select at least one role", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Created user ${data.user.email}`);
        setNewUserModalOpen(false);
        setNewUserForm(initialNewUser);
        await loadUsers();
      } else {
        showToast(data.error || "Failed to create user", "error");
      }
    } catch (e) {
      showToast("Failed to create user", "error");
    } finally {
      setSaving(false);
    }
  };

  // Edit User Handler
  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${editUserModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: {
            email: editUserModal.email,
            full_name_ur: editUserModal.full_name_ur,
            full_name_en: editUserModal.full_name_en,
            byline_name: editUserModal.byline_name,
            designation_ur: editUserModal.designation_ur,
            designation_en: editUserModal.designation_en,
            bio_ur: editUserModal.bio_ur,
            bio_en: editUserModal.bio_en,
            roles: editUserModal.roles,
            desk_scope: editUserModal.desk_scope,
            is_public_author: editUserModal.is_public_author,
            status: editUserModal.status,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.user) {
          setUsers((prev) =>
            prev.map((u) => (String(u.id) === String(data.user.id) ? data.user : u))
          );
        }
        showToast(`Updated user profile for ${data.user?.email || editUserModal.email}`);
        setEditUserModal(null);
        await loadUsers();
      } else {
        showToast(data.error || "Failed to update user", "error");
      }
    } catch (e) {
      showToast("Failed to update user", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset Password Handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordModal) return;
    if (!newPasswordValue || newPasswordValue.length < 10) {
      showToast("Password must be at least 10 characters", "error");
      return;
    }
    try {
      setSaving(true);
      const res = await fetch(`/api/users/${passwordModal.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newPassword: newPasswordValue,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Password reset for ${passwordModal.email}. User signed out.`);
        setPasswordModal(null);
        setNewPasswordValue("");
        await loadUsers();
      } else {
        showToast(data.error || "Failed to reset password", "error");
      }
    } catch (e) {
      showToast("Failed to reset password", "error");
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

      {/* Header with emerald accent bar */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div className="border-l-4 border-[#184e2d] pl-3">
          <h1 className="text-xl font-bold tracking-tight text-gray-900">Users & Roles</h1>
          <p className="mt-0.5 text-xs text-gray-500">
            Manage newsroom staff, role-based permissions, and desk access scopes
          </p>
        </div>
        {canManageUsers && (
          <button
            onClick={() => setNewUserModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-4 py-2 text-xs sm:text-sm font-semibold transition bg-[#184e2d] text-white shadow-2xs hover:bg-[#0d3b20]"
          >
            + New User
          </button>
        )}
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg border border-[#e5e2da] bg-white px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-md bg-[#184e2d]/10 text-[#184e2d] flex items-center justify-center shrink-0">
            <Users size={17} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Staff</p>
            <p className="text-lg font-bold text-gray-900 font-mono">{users.length}</p>
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e2da] bg-white px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck size={17} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Active</p>
            <p className="text-lg font-bold text-emerald-800 font-mono">{activeUsersCount}</p>
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e2da] bg-white px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <KeyRound size={17} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Inactive</p>
            <p className="text-lg font-bold text-gray-800 font-mono">{inactiveUsersCount}</p>
          </div>
        </div>
        <div className="rounded-lg border border-[#e5e2da] bg-white px-4 py-3 flex items-center gap-3">
          <div className="size-9 rounded-md bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
            <ShieldCheck size={17} />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Roles</p>
            <p className="text-lg font-bold text-gray-900 font-mono">{rolesList.length}</p>
          </div>
        </div>
      </div>

      {/* Balanced 12-Col Split Layout (7 Cols Users, 5 Cols Roles) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-start">
        {/* Left Column: Newsroom Users */}
        <section className="lg:col-span-7 rounded-lg border border-[#e5e2da] bg-white shadow-2xs overflow-hidden">
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#e5e2da] px-4 py-3 bg-[#faf9f6]">
            <div className="flex items-center gap-2">
              <h2 className="text-[0.6875rem] font-bold tracking-wide text-gray-600 uppercase">
                Newsroom Users ({filteredUsers.length})
              </h2>
              {roleFilter !== "all" && (
                <button
                  type="button"
                  onClick={() => setRoleFilter("all")}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#184e2d] text-white flex items-center gap-1 cursor-pointer"
                >
                  <span>{roleFilter}</span>
                  <X size={10} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="px-2 py-1 text-xs border border-[#e5e2da] rounded bg-white text-gray-700 focus:outline-none focus:border-[#184e2d] cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search staff..."
                  className="pl-7 pr-2.5 py-1 text-xs border border-[#e5e2da] rounded bg-white text-gray-800 focus:outline-none focus:border-[#184e2d] w-44"
                />
              </div>
            </div>
          </header>

          <ul className="divide-y divide-[#e5e2da]">
            {loading ? (
              <li className="p-8 text-center text-xs text-gray-400">Loading users...</li>
            ) : filteredUsers.length === 0 ? (
              <li className="p-8 text-center text-xs text-gray-400">No users match the current filter.</li>
            ) : (
              filteredUsers.map((user) => {
                const initial = (user.full_name_en || user.email || "u").trim().charAt(0).toUpperCase();
                const userRoles = Array.isArray(user.roles) ? user.roles : [];
                const isActive = (user.status || "Active").toLowerCase() === "active";

                return (
                  <li
                    key={user.id || user.email}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 hover:bg-[#f9f8f5] transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className="size-9 rounded-full bg-[#184e2d]/10 text-[#184e2d] border border-[#184e2d]/20 text-sm font-bold flex items-center justify-center shrink-0">
                        {initial}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {user.full_name_en || user.email}
                          </p>
                          {user.full_name_ur && (
                            <span className="text-xs text-gray-500 font-nastaliq">
                              ({user.full_name_ur})
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-gray-500 font-mono">
                          {user.email}
                          {user.designation_en ? ` · ${user.designation_en}` : ""}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {userRoles.map((r) => (
                            <span
                              key={r}
                              className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-sky-50 text-sky-700 border border-sky-200"
                            >
                              {r}
                            </span>
                          ))}
                          <span
                            className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between gap-1.5">
                      <p className="text-[11px] text-gray-400 font-sans">
                        {user.last_active || "Never signed in"}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        {canManageUsers && (
                          <button
                            type="button"
                            aria-label="Edit"
                            title="Edit user"
                            onClick={() => setEditUserModal({ ...user })}
                            className="text-gray-500 hover:bg-[#f2efe9] hover:text-[#184e2d] p-1.5 rounded-md transition-colors cursor-pointer"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {canResetPassword && (
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModal(user);
                              setNewPasswordValue("");
                            }}
                            className="text-xs font-semibold px-2.5 py-1 text-gray-600 hover:bg-[#f2efe9] hover:text-gray-900 rounded-md transition-colors cursor-pointer border border-[#e5e2da]"
                          >
                            Password
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* Right Column: Roles and Permissions (Click to filter users) */}
        <div className="lg:col-span-5">
          <section className="rounded-lg border border-[#e5e2da] bg-white shadow-2xs overflow-hidden">
            <header className="flex items-center justify-between gap-4 border-b border-[#e5e2da] px-4 py-3 bg-[#faf9f6]">
              <h2 className="text-[0.6875rem] font-bold tracking-wide text-gray-600 uppercase">
                Roles & Permissions
              </h2>
              <span className="text-[10px] text-gray-400">Click role to filter</span>
            </header>

            <ul className="divide-y divide-[#e5e2da]">
              {rolesList.map((role) => {
                const count = role.userCount ?? 0;
                const isSuper = role.key === "super_admin";
                const isSelected = roleFilter.toLowerCase() === String(role.nameEn || "").toLowerCase();
                return (
                  <li
                    key={role.id}
                    onClick={() => setRoleFilter(isSelected ? "all" : role.nameEn)}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? "bg-emerald-50/70" : "hover:bg-[#f9f8f5]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {role.nameEn}
                        </span>
                        <p className="font-mono text-[11px] text-gray-400 mt-0.5">{role.key}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {isSuper ? "all permissions" : `${(role.permissions || []).length} permissions`}
                        </span>
                        <span className="rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {count} {count === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </div>
                    {role.description && (
                      <p className="mt-1.5 text-xs leading-6 text-gray-500">{role.description}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Standalone scope notice callout */}
          <p className="mt-4 rounded-md border border-[#e5e2da] bg-[#faf9f6] px-4 py-3 text-xs leading-6 text-gray-500">
            Newsroom roles, narrowed by two scopes. Desk scope limits a user to certain sections — give one Sports and they cannot publish into Pakistan. The edition is a per-user scope too: drop article.language.en and they never see or touch the English articles. Both are enforced by the API, not just hidden here.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: NEW USER */}
      {/* ======================================================== */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-[#e5e2da] px-6 py-4 bg-white shrink-0">
              <h2 className="text-base font-semibold text-gray-900">New user</h2>
              <button
                type="button"
                onClick={() => setNewUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleCreateUser} id="newUserForm" className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Email & Starting Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="reporter@dailyafadiat.com"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">This is how they sign in</p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Starting password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={newUserForm.starting_password}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, starting_password: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    At least 10 characters — they must change it on first sign-in
                  </p>
                </div>
              </div>

              {/* Full Name Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (Urdu) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    placeholder="محمد علی"
                    value={newUserForm.full_name_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_ur: e.target.value })
                    }
                    className={URDU_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Muhammad Ali"
                    value={newUserForm.full_name_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_en: e.target.value })
                    }
                    className={EN_INPUT_CLASS}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used on the English edition's byline
                  </p>
                </div>
              </div>

              {/* Byline Name */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Byline name</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="علی خان"
                  value={newUserForm.byline_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, byline_name: e.target.value })}
                  className={URDU_INPUT_CLASS}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Overrides the full name on published stories
                </p>
              </div>

              {/* Designation Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (Urdu)</label>
                  <input
                    type="text"
                    dir="rtl"
                    placeholder="سینئر رپورٹر"
                    value={newUserForm.designation_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_ur: e.target.value })
                    }
                    className={URDU_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    placeholder="Senior Reporter"
                    value={newUserForm.designation_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_en: e.target.value })
                    }
                    className={EN_INPUT_CLASS}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Used on the English edition</p>
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={newUserForm.bio_ur}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_ur: e.target.value })}
                    className={URDU_TEXTAREA_CLASS}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Shown on the Urdu author page — Google News expects one
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={newUserForm.bio_en}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_en: e.target.value })}
                    className={EN_TEXTAREA_CLASS}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Shown on the English edition's author page
                  </p>
                </div>
              </div>

              {/* Roles Multi-Select Buttons */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Roles *</label>
                <div className="flex flex-wrap gap-2">
                  {rolesList.map((r) => {
                    const selected = newUserForm.roles.includes(r.nameEn);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? newUserForm.roles.filter((x) => x !== r.nameEn)
                            : [...newUserForm.roles, r.nameEn];
                          setNewUserForm({ ...newUserForm, roles: updated });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-700 border-[#e5e2da] hover:bg-gray-50"
                        }`}
                      >
                        {r.nameEn}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">A user can hold more than one</p>
              </div>

              {/* Desk Scope Pills */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Desk scope</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#e5e2da] rounded-md bg-[#faf9f6]">
                  {deskSections.map((sec) => {
                    const selected = newUserForm.desk_scope.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? newUserForm.desk_scope.filter((x) => x !== sec)
                            : [...newUserForm.desk_scope, sec];
                          setNewUserForm({ ...newUserForm, desk_scope: updated });
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-600 border-[#e5e2da] hover:bg-gray-100"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Leave empty for site-wide access. Otherwise they only see and publish into these sections.
                </p>
              </div>

              {/* Public Author Toggle Switch */}
              <div className="pt-2 border-t border-[#e5e2da] flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 block">Public author</span>
                  <span className="text-[11px] text-gray-500">
                    Gives them a byline page on the site. Turn off for desk-only accounts.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newUserForm.is_public_author}
                  onClick={() =>
                    setNewUserForm({ ...newUserForm, is_public_author: !newUserForm.is_public_author })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    newUserForm.is_public_author ? "bg-emerald-800" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      newUserForm.is_public_author ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </form>

            {/* Modal Fixed Footer */}
            <footer className="flex items-center justify-end gap-3 border-t border-[#e5e2da] px-6 py-4 bg-[#faf9f6] shrink-0">
              <button
                type="button"
                onClick={() => setNewUserModalOpen(false)}
                className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="newUserForm"
                disabled={saving}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded-md text-xs font-semibold shadow-2xs"
              >
                Create user
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER */}
      {/* ======================================================== */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <header className="flex items-center justify-between border-b border-[#e5e2da] px-6 py-4 bg-white shrink-0">
              <h2 className="text-base font-semibold text-gray-900">
                Edit {editUserModal.email}
              </h2>
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </header>

            {/* Modal Scrollable Body */}
            <form onSubmit={handleSaveEditUser} id="editUserForm" className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Sign-in Email */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Sign-in Email *</label>
                <input
                  type="email"
                  dir="ltr"
                  required
                  value={editUserModal.email || ""}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, email: e.target.value })
                  }
                  className={EN_INPUT_CLASS}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Changing this updates the email address used to sign in
                </p>
              </div>

              {/* Full Name Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (Urdu) *</label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={editUserModal.full_name_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_ur: e.target.value })
                    }
                    className={URDU_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editUserModal.full_name_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_en: e.target.value })
                    }
                    className={EN_INPUT_CLASS}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used on the English edition's byline
                  </p>
                </div>
              </div>

              {/* Byline Name */}
              <div>
                <label className="block font-medium text-gray-700 mb-1">Byline name</label>
                <input
                  type="text"
                  dir="rtl"
                  value={editUserModal.byline_name || ""}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, byline_name: e.target.value })
                  }
                  className={URDU_INPUT_CLASS}
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Overrides the full name on published stories
                </p>
              </div>

              {/* Designation Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (Urdu)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={editUserModal.designation_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_ur: e.target.value })
                    }
                    className={URDU_INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editUserModal.designation_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_en: e.target.value })
                    }
                    className={EN_INPUT_CLASS}
                  />
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={editUserModal.bio_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_ur: e.target.value })
                    }
                    className={URDU_TEXTAREA_CLASS}
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={3}
                    dir="ltr"
                    value={editUserModal.bio_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_en: e.target.value })
                    }
                    className={EN_TEXTAREA_CLASS}
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Roles *</label>
                <div className="flex flex-wrap gap-2">
                  {rolesList.map((r) => {
                    const selected = editUserModal.roles?.includes(r.nameEn);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? (editUserModal.roles || []).filter((x) => x !== r.nameEn)
                            : [...(editUserModal.roles || []), r.nameEn];
                          setEditUserModal({ ...editUserModal, roles: updated });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-700 border-[#e5e2da] hover:bg-gray-50"
                        }`}
                      >
                        {r.nameEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desk Scope */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Desk scope</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#e5e2da] rounded-md bg-[#faf9f6]">
                  {deskSections.map((sec) => {
                    const selected = editUserModal.desk_scope?.includes(sec);
                    return (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? (editUserModal.desk_scope || []).filter((x) => x !== sec)
                            : [...(editUserModal.desk_scope || []), sec];
                          setEditUserModal({ ...editUserModal, desk_scope: updated });
                        }}
                        className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-600 border-[#e5e2da] hover:bg-gray-100"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Author Toggle Switch */}
              <div className="pt-2 border-t border-[#e5e2da] flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 block">Public author</span>
                  <span className="text-[11px] text-gray-500">
                    Gives them a byline page on the site. Turn off for desk-only accounts.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editUserModal.is_public_author ?? true}
                  onClick={() =>
                    setEditUserModal({
                      ...editUserModal,
                      is_public_author: !Boolean(editUserModal.is_public_author),
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    editUserModal.is_public_author ?? true ? "bg-emerald-800" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      editUserModal.is_public_author ?? true ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Active Toggle Switch */}
              <div className="pt-2 border-t border-[#e5e2da] flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-900 block">Active</span>
                  <span className="text-[11px] text-gray-500">
                    A disabled user cannot sign in; their published stories stay up.
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={editUserModal.status === "Active"}
                  onClick={() =>
                    setEditUserModal({
                      ...editUserModal,
                      status: editUserModal.status === "Active" ? "Disabled" : "Active",
                    })
                  }
                  className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    editUserModal.status === "Active" ? "bg-emerald-800" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white shadow transition-transform absolute top-0.5 ${
                      editUserModal.status === "Active" ? "left-5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </form>

            {/* Modal Fixed Footer */}
            <footer className="flex items-center justify-end gap-3 border-t border-[#e5e2da] px-6 py-4 bg-[#faf9f6] shrink-0">
              <button
                type="button"
                onClick={() => setEditUserModal(null)}
                className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="editUserForm"
                disabled={saving}
                className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded-md text-xs font-semibold shadow-2xs"
              >
                Save changes
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SET PASSWORD */}
      {/* ======================================================== */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <header className="flex items-center justify-between border-b border-[#e5e2da] px-6 py-4 bg-white">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                Set a new password for {passwordModal.email}
              </h3>
              <button
                type="button"
                onClick={() => setPasswordModal(null)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <form onSubmit={handleResetPassword} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                <span>
                  Every active session of theirs is signed out, and they must change it again on next sign-in.
                </span>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">New password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white font-mono"
                />
                <p className="text-[11px] text-gray-400 mt-1">At least 10 characters</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e2da]">
                <button
                  type="button"
                  onClick={() => setPasswordModal(null)}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 rounded-md text-xs font-semibold shadow-2xs"
                >
                  Reset password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
