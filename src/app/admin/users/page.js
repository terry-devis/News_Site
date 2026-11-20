"use client";
import React, { useState, useEffect } from "react";
import { Pencil, X, AlertTriangle, Check } from "lucide-react";

const SYSTEM_ROLES = [
  {
    key: "Super Admin",
    id: "super_admin",
    name: "Super Admin",
    perms: "all permissions",
    desc: "Full control including roles, users and settings.",
  },
  {
    key: "Editor-in-Chief",
    id: "editor_in_chief",
    name: "Editor-in-Chief",
    perms: "40 permissions",
    desc: "Full editorial control — publishing, layout, settings, users and reading roles — but cannot edit roles or permissions.",
  },
  {
    key: "Editor",
    id: "editor",
    name: "Editor",
    perms: "25 permissions",
    desc: "Creates, edits and publishes articles; runs breaking news and live coverage; moderates comments and manages media and sections.",
  },
  {
    key: "Sub-Editor",
    id: "sub_editor",
    name: "Sub-Editor",
    perms: "11 permissions",
    desc: "Copy-edits any article and moves stories through the workflow (approve to ready), but cannot publish.",
  },
  {
    key: "Reporter",
    id: "reporter",
    name: "Reporter",
    perms: "6 permissions",
    desc: "Creates and edits their own drafts, submits them for review and uploads media; cannot publish.",
  },
  {
    key: "Columnist",
    id: "columnist",
    name: "Columnist",
    perms: "7 permissions",
    desc: "Authors opinion and column pieces and submits them for review; cannot publish.",
  },
];

const DESK_SECTIONS = [
  "kheel",
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

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);
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
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
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

  const getUserCountForRole = (roleKey) => {
    return users.filter((u) => u.roles && u.roles.includes(roleKey)).length;
  };

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
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editUserModal.id,
          updates: {
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
        showToast(`Updated user profile for ${editUserModal.email}`);
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
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset_password",
          id: passwordModal.id,
          email: passwordModal.email,
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
        <div className="border-l-4 border-emerald-800 pl-3">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">Users & roles</h1>
          <p className="mt-0.5 text-[0.8125rem] text-gray-500">
            A role is just a set of permissions — adding one needs no code change
          </p>
        </div>
        <button
          onClick={() => setNewUserModalOpen(true)}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition bg-emerald-800 text-white shadow-2xs hover:bg-emerald-900"
        >
          + New user
        </button>
      </div>

      {/* Equal 2-Column Split Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 items-start">
        {/* Left Column: Newsroom Users */}
        <section className="rounded-lg border border-[#e5e2da] bg-white shadow-2xs overflow-hidden">
          <header className="flex items-center justify-between gap-4 border-b border-[#e5e2da] px-4 py-2.5 bg-[#faf9f6]">
            <h2 className="text-[0.6875rem] font-bold tracking-wide text-gray-500 uppercase">
              Newsroom users
            </h2>
          </header>

          <ul className="divide-y divide-[#e5e2da]">
            {loading ? (
              <li className="p-8 text-center text-xs text-gray-400">Loading users...</li>
            ) : users.length === 0 ? (
              <li className="p-8 text-center text-xs text-gray-400">No users found.</li>
            ) : (
              users.map((user) => {
                const initial = (user.email || "u").trim().charAt(0).toLowerCase();
                const primaryRole = user.roles?.[0] || "";
                const isActive = user.status === "Active";

                return (
                  <li
                    key={user.id || user.email}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-[#f9f8f5] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 36x36 circular avatar taking email initial */}
                      <div className="size-9 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center justify-center shrink-0 uppercase">
                        {initial}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <p className="truncate text-sm font-medium text-gray-900 font-mono">
                          {user.email}
                        </p>
                        <p className="auto-dir truncate text-xs text-gray-500 font-nastaliq">
                          {user.full_name_ur || user.full_name_en}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {primaryRole && (
                            <span className="inline-flex items-center rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              {primaryRole}
                            </span>
                          )}
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

                    <div className="shrink-0 text-right space-y-1">
                      <p className="mb-1 text-[11px] text-gray-400">
                        {user.last_active || "never signed in"}
                      </p>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          aria-label="Edit"
                          title="Edit"
                          onClick={() => setEditUserModal({ ...user })}
                          className="text-gray-400 hover:bg-[#f2efe9] hover:text-gray-700 p-1.5 rounded-md transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModal(user);
                            setNewPasswordValue("");
                          }}
                          className="text-xs font-semibold px-2.5 py-1 text-gray-500 hover:bg-[#f2efe9] hover:text-gray-900 rounded-md transition-colors"
                        >
                          Password
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        {/* Right Column: Roles and Permissions */}
        <div>
          <section className="rounded-lg border border-[#e5e2da] bg-white shadow-2xs overflow-hidden">
            <header className="flex items-center justify-between gap-4 border-b border-[#e5e2da] px-4 py-2.5 bg-[#faf9f6]">
              <h2 className="text-[0.6875rem] font-bold tracking-wide text-gray-500 uppercase">
                Roles and permissions
              </h2>
            </header>

            <ul className="divide-y divide-[#e5e2da]">
              {SYSTEM_ROLES.map((role) => {
                const count = getUserCountForRole(role.key);
                return (
                  <li key={role.id} className="p-4 hover:bg-[#f9f8f5] transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block">
                          {role.name}
                        </span>
                        <p className="font-mono text-[11px] text-gray-400 mt-0.5">{role.id}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          {role.perms}
                        </span>
                        <span className="rounded-sm px-1.5 py-0.5 text-[0.6875rem] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                          {count} {count === 1 ? "user" : "users"}
                        </span>
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs leading-6 text-gray-500">{role.desc}</p>
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
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
                    placeholder="reporter@dailyinsaf.pk"
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
                    required
                    placeholder="محمد علی"
                    value={newUserForm.full_name_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_ur: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    placeholder="Muhammad Ali"
                    value={newUserForm.full_name_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_en: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
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
                  placeholder="علی خان"
                  value={newUserForm.byline_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, byline_name: e.target.value })}
                  className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white font-nastaliq"
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
                    placeholder="سینئر رپورٹر"
                    value={newUserForm.designation_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_ur: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    placeholder="Senior Reporter"
                    value={newUserForm.designation_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_en: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">Used on the English edition</p>
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={2}
                    value={newUserForm.bio_ur}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_ur: e.target.value })}
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Shown on the Urdu author page — Google News expects one
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={2}
                    value={newUserForm.bio_en}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_en: e.target.value })}
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
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
                  {SYSTEM_ROLES.map((r) => {
                    const selected = newUserForm.roles.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? newUserForm.roles.filter((x) => x !== r.key)
                            : [...newUserForm.roles, r.key];
                          setNewUserForm({ ...newUserForm, roles: updated });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-700 border-[#e5e2da] hover:bg-gray-50"
                        }`}
                      >
                        {r.name}
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
                  {DESK_SECTIONS.map((sec) => {
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
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
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
              {/* Full Name Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (Urdu) *</label>
                  <input
                    type="text"
                    required
                    value={editUserModal.full_name_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_ur: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    value={editUserModal.full_name_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_en: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
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
                  value={editUserModal.byline_name || ""}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, byline_name: e.target.value })
                  }
                  className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white font-nastaliq"
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
                    value={editUserModal.designation_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_ur: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    value={editUserModal.designation_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_en: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
                  />
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={2}
                    value={editUserModal.bio_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_ur: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 font-nastaliq focus:outline-emerald-800 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={2}
                    value={editUserModal.bio_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_en: e.target.value })
                    }
                    className="w-full rounded-md border border-[#e5e2da] px-3 py-2 text-xs text-gray-900 focus:outline-emerald-800 bg-white"
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Roles *</label>
                <div className="flex flex-wrap gap-2">
                  {SYSTEM_ROLES.map((r) => {
                    const selected = editUserModal.roles?.includes(r.key);
                    return (
                      <button
                        key={r.key}
                        type="button"
                        onClick={() => {
                          const updated = selected
                            ? (editUserModal.roles || []).filter((x) => x !== r.key)
                            : [...(editUserModal.roles || []), r.key];
                          setEditUserModal({ ...editUserModal, roles: updated });
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-emerald-800 text-white border-emerald-900"
                            : "bg-white text-gray-700 border-[#e5e2da] hover:bg-gray-50"
                        }`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Desk Scope */}
              <div>
                <label className="block font-medium text-gray-700 mb-1.5">Desk scope</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#e5e2da] rounded-md bg-[#faf9f6]">
                  {DESK_SECTIONS.map((sec) => {
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
