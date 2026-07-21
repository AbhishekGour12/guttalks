/**
 * adminStorage — admin session helpers.
 *
 * Token is stored as-is under "adminToken" (JWT is already opaque).
 * Admin info is base64-encoded under "_agi" to avoid plain JSON in DevTools.
 *
 * All functions are safe to call only from client-side code ("use client" components).
 */

const TOKEN_KEY = "adminToken";
const INFO_KEY  = "_agi";

// ─── Token ────────────────────────────────────────────────────────────────────

export function setAdminToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

// ─── Info ─────────────────────────────────────────────────────────────────────

export function setAdminInfo(info) {
  // Backend returns { id, name, email, role } — normalise _id/id
  const safe = {
    id:    info.id    || info._id || "",
    name:  info.name  || "",
    email: info.email || "",
    role:  info.role  || "admin",
  };
  try {
    localStorage.setItem(INFO_KEY, btoa(JSON.stringify(safe)));
  } catch (_) { /* non-critical */ }
}

export function getAdminInfo() {
  const raw = localStorage.getItem(INFO_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(atob(raw));
  } catch (_) {
    return null;
  }
}

// ─── Clear ────────────────────────────────────────────────────────────────────

export function clearAdminSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(INFO_KEY);
}

// ─── Guard ────────────────────────────────────────────────────────────────────

/** Returns true when a valid-looking admin token exists in localStorage. */
export function isAdminLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}
