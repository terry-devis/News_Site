// Edge-compatible HMAC-SHA256 session token helpers (Web Crypto API)

export const SESSION_COOKIE_NAME = "da_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getSecret() {
  return (
    process.env.AUTH_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "daily-afadiat-dev-session-secret-change-me"
  );
}

function toBase64Url(bytes) {
  let binary = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacKey() {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function signSessionToken(payload) {
  const data = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  const key = await getHmacKey();
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(encodedPayload));
  return `${encodedPayload}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  try {
    const [encodedPayload, encodedSig] = token.split(".");
    if (!encodedPayload || !encodedSig) return null;

    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(encodedSig),
      new TextEncoder().encode(encodedPayload)
    );
    if (!valid) return null;

    const json = new TextDecoder().decode(fromBase64Url(encodedPayload));
    const payload = JSON.parse(json);
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
