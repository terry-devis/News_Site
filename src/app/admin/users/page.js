"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit2,
  KeyRound,
  ShieldCheck,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  UserX,
  Shield,
  Layers,
  Lock,
} from "lucide-react";

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

  // Compute user count per role
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-emerald-800" size={24} />
            <span>Users & roles</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            A role is just a set of permissions — adding one needs no code change
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewUserModalOpen(true)}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus size={15} />
            <span>+ New user</span>
          </button>
        </div>
      </div>

      {/* Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Newsroom Users (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#e5e2da] bg-[#faf9f6]">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Newsroom Users
            </h2>
          </div>

          <div className="divide-y divide-[#e5e2da]">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">No users found.</div>
            ) : (
              users.map((user) => {
                const initial = (user.full_name_en || user.email || "U")
                  .trim()
                  .charAt(0)
                  .toUpperCase();
                const primaryRole = user.roles?.[0] || "";
                const isActive = user.status === "Active";

                return (
                  <div
                    key={user.id || user.email}
                    className="p-4 hover:bg-[#f9f8f5] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold flex items-center justify-center text-sm shrink-0 mt-0.5">
                        {initial}
                      </div>

                      {/* User Info */}
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-900 text-xs sm:text-sm font-mono">
                            {user.email}
                          </span>
                          {primaryRole && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200 bg-blue-50/70 text-blue-700">
                              {primaryRole}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                              isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-gray-100 text-gray-500 border-gray-200"
                            }`}
                          >
                            {user.status || "Active"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                          {user.full_name_ur && (
                            <span className="font-nastaliq font-bold text-gray-900">
                              {user.full_name_ur}
                            </span>
                          )}
                          {user.full_name_en && (
                            <span className="text-gray-500">· {user.full_name_en}</span>
                          )}
                          {user.designation_ur && (
                            <span className="text-[11px] text-gray-400 font-nastaliq">
                              ({user.designation_ur})
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-gray-400">
                          {user.last_active || "never signed in"}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setEditUserModal({ ...user })}
                        className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors"
                      >
                        <Edit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setPasswordModal(user);
                          setNewPasswordValue("");
                        }}
                        className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-2.5 py-1.5 rounded text-xs font-semibold shadow-2xs flex items-center gap-1 transition-colors"
                      >
                        <KeyRound size={12} />
                        <span>Password</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Roles and Permissions (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#e5e2da] shadow-2xs overflow-hidden space-y-0">
          <div className="p-4 border-b border-[#e5e2da] bg-[#faf9f6]">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Roles and Permissions
            </h2>
          </div>

          <div className="divide-y divide-[#e5e2da]">
            {SYSTEM_ROLES.map((role) => {
              const count = getUserCountForRole(role.key);
              return (
                <div key={role.id} className="p-4 hover:bg-[#f9f8f5] transition-colors space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{role.name}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded border border-gray-200">
                        {role.perms}
                      </span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                        {count} {count === 1 ? "user" : "users"}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 leading-relaxed">{role.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Scope notice in card footer */}
          <div className="p-4 border-t border-[#e5e2da] bg-[#faf9f6] text-[11px] text-gray-500 leading-relaxed space-y-1">
            <p>
              Newsroom roles, narrowed by two scopes. Desk scope limits a user to certain sections — give one Sports and they cannot publish into Pakistan.
            </p>
            <p>
              The edition is a per-user scope too: drop article.language.en and they never see or touch the English articles. Both are enforced by the API, not just hidden here.
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: NEW USER */}
      {/* ======================================================== */}
      {newUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3">
              <h3 className="text-base font-bold text-gray-900">New user</h3>
              <button
                onClick={() => setNewUserModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Email & Starting Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="reporter@dailyinsaf.pk"
                    value={newUserForm.email}
                    onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">This is how they sign in</span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Starting password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={newUserForm.starting_password}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, starting_password: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    At least 10 characters — they must change it on first sign-in
                  </span>
                </div>
              </div>

              {/* Full Name Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full name (Urdu) *</label>
                  <input
                    type="text"
                    required
                    placeholder="محمد علی"
                    value={newUserForm.full_name_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_ur: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    placeholder="Muhammad Ali"
                    value={newUserForm.full_name_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, full_name_en: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Used on the English edition's byline
                  </span>
                </div>
              </div>

              {/* Byline Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Byline name</label>
                <input
                  type="text"
                  placeholder="علی خان"
                  value={newUserForm.byline_name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, byline_name: e.target.value })}
                  className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800 font-nastaliq"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Overrides the full name on published stories
                </span>
              </div>

              {/* Designation Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation (Urdu)</label>
                  <input
                    type="text"
                    placeholder="سینئر رپورٹر"
                    value={newUserForm.designation_ur}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_ur: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    placeholder="Senior Reporter"
                    value={newUserForm.designation_en}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, designation_en: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Used on the English edition
                  </span>
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={2}
                    value={newUserForm.bio_ur}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_ur: e.target.value })}
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Shown on the Urdu author page — Google News expects one
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={2}
                    value={newUserForm.bio_en}
                    onChange={(e) => setNewUserForm({ ...newUserForm, bio_en: e.target.value })}
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Shown on the English edition's author page
                  </span>
                </div>
              </div>

              {/* Roles Multi-Select */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Roles *</label>
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
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
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
                <span className="text-[10px] text-gray-400 mt-1 block">A user can hold more than one</span>
              </div>

              {/* Desk Scope Pills */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Desk scope</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#e5e2da] rounded bg-gray-50/50">
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
                            ? "bg-emerald-700 text-white border-emerald-800"
                            : "bg-white text-gray-600 border-[#e5e2da] hover:bg-gray-100"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Leave empty for site-wide access. Otherwise they only see and publish into these sections.
                </span>
              </div>

              {/* Public Author Switch */}
              <div className="pt-2 border-t border-[#e5e2da]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newUserForm.is_public_author}
                    onChange={(e) =>
                      setNewUserForm({ ...newUserForm, is_public_author: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Public author</span>
                    <span className="text-[11px] text-gray-500">
                      Gives them a byline page on the site. Turn off for desk-only accounts.
                    </span>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e2da]">
                <button
                  type="button"
                  onClick={() => setNewUserModalOpen(false)}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded text-xs font-semibold shadow-2xs"
                >
                  Create user
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER */}
      {/* ======================================================== */}
      {editUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-2xl max-w-xl w-full p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3">
              <h3 className="text-base font-bold text-gray-900">Edit {editUserModal.email}</h3>
              <button
                onClick={() => setEditUserModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs">
              {/* Full Name Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full name (Urdu) *</label>
                  <input
                    type="text"
                    required
                    value={editUserModal.full_name_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_ur: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full name (English)</label>
                  <input
                    type="text"
                    value={editUserModal.full_name_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, full_name_en: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Used on the English edition's byline
                  </span>
                </div>
              </div>

              {/* Byline Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Byline name</label>
                <input
                  type="text"
                  value={editUserModal.byline_name || ""}
                  onChange={(e) =>
                    setEditUserModal({ ...editUserModal, byline_name: e.target.value })
                  }
                  className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800 font-nastaliq"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Overrides the full name on published stories
                </span>
              </div>

              {/* Designation Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation (Urdu)</label>
                  <input
                    type="text"
                    value={editUserModal.designation_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_ur: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    value={editUserModal.designation_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, designation_en: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                </div>
              </div>

              {/* Bio Urdu & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bio (Urdu)</label>
                  <textarea
                    rows={2}
                    value={editUserModal.bio_ur || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_ur: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 font-nastaliq focus:outline-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Bio (English)</label>
                  <textarea
                    rows={2}
                    value={editUserModal.bio_en || ""}
                    onChange={(e) =>
                      setEditUserModal({ ...editUserModal, bio_en: e.target.value })
                    }
                    className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800"
                  />
                </div>
              </div>

              {/* Roles */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">Roles *</label>
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
                        className={`px-3 py-1.5 rounded text-xs font-semibold border transition-colors ${
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
                <label className="block font-bold text-gray-700 mb-1.5">Desk scope</label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-[#e5e2da] rounded bg-gray-50/50">
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
                            ? "bg-emerald-700 text-white border-emerald-800"
                            : "bg-white text-gray-600 border-[#e5e2da] hover:bg-gray-100"
                        }`}
                      >
                        {sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Public Author Switch */}
              <div className="pt-2 border-t border-[#e5e2da]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUserModal.is_public_author ?? true}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        is_public_author: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Public author</span>
                    <span className="text-[11px] text-gray-500">
                      Gives them a byline page on the site. Turn off for desk-only accounts.
                    </span>
                  </div>
                </label>
              </div>

              {/* Active Switch */}
              <div className="pt-2 border-t border-[#e5e2da]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editUserModal.status === "Active"}
                    onChange={(e) =>
                      setEditUserModal({
                        ...editUserModal,
                        status: e.target.checked ? "Active" : "Disabled",
                      })
                    }
                    className="w-4 h-4 text-emerald-800 rounded border-gray-300 focus:ring-emerald-700 cursor-pointer"
                  />
                  <div>
                    <span className="font-bold text-gray-900 block">Active</span>
                    <span className="text-[11px] text-gray-500">
                      A disabled user cannot sign in; their published stories stay up.
                    </span>
                  </div>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e2da]">
                <button
                  type="button"
                  onClick={() => setEditUserModal(null)}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-2 rounded text-xs font-semibold shadow-2xs"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: SET PASSWORD */}
      {/* ======================================================== */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-[#e5e2da] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                Set a new password for {passwordModal.email}
              </h3>
              <button
                onClick={() => setPasswordModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5" />
              <span>
                Every active session of theirs is signed out, and they must change it again on next sign-in.
              </span>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">New password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  className="w-full border border-[#e5e2da] rounded px-3 py-2 bg-white text-gray-900 focus:outline-emerald-800 font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">At least 10 characters</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#e5e2da]">
                <button
                  type="button"
                  onClick={() => setPasswordModal(null)}
                  className="border border-[#e5e2da] bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-1.5 rounded text-xs font-semibold shadow-2xs"
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
