import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./authEdge";
import { getPermissionsForRoles, hasPermission } from "./permissions";

const SCRYPT_PREFIX = "scrypt$";

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${SCRYPT_PREFIX}${salt}$${derived}`;
}

export function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword) return false;

  // 1. Seeded/bootstrap accounts with missing or masked placeholder password accept ADMIN_DEFAULT_PASSWORD (or Admin@1234)
  if (!storedPassword || storedPassword === "••••••••••••") {
    const bootstrapPassword = process.env.ADMIN_DEFAULT_PASSWORD || "Admin@1234";
    return String(inputPassword) === bootstrapPassword;
  }

  // 2. Scrypt hashed password
  if (String(storedPassword).startsWith(SCRYPT_PREFIX)) {
    const parts = String(storedPassword).split("$");
    if (parts.length !== 3) return false;
    const [, salt, hashHex] = parts;
    const derived = crypto.scryptSync(String(inputPassword), salt, 64);
    const storedBuf = Buffer.from(hashHex, "hex");
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  }

  // 3. Plaintext fallback for legacy records created before hashing
  return String(inputPassword) === String(storedPassword);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  const permissions = getPermissionsForRoles(roles);
  return {
    id: user.id,
    email: user.email,
    full_name_en: user.full_name_en || user.email,
    full_name_ur: user.full_name_ur || user.full_name_en || user.email,
    byline_name: user.byline_name || user.full_name_ur || user.full_name_en,
    designation_en: user.designation_en || roles[0] || "Staff",
    designation_ur: user.designation_ur || "",
    roles,
    desk_scope: Array.isArray(user.desk_scope) ? user.desk_scope : [],
    status: user.status || "Active",
    permissions,
  };
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = await verifySessionToken(token);
    if (!payload) return null;
    const roles = Array.isArray(payload.roles) ? payload.roles : [];
    let roleMap = null;
    try {
      const { getRolePermissionMap } = await import("./cmsDb.js");
      roleMap = await getRolePermissionMap();
    } catch {
      roleMap = null;
    }
    return {
      ...payload,
      permissions: getPermissionsForRoles(roles, roleMap),
    };
  } catch {
    return null;
  }
}

export async function requirePermission(permission) {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized — please sign in" }, { status: 401 }),
    };
  }
  if (permission && !hasPermission(user, permission)) {
    return {
      user,
      errorResponse: NextResponse.json({ error: "Forbidden — insufficient permissions" }, { status: 403 }),
    };
  }
  return { user, errorResponse: null };
}
