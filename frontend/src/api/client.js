// src/api/client.js
// Central HTTP client.  Reads the JWT from localStorage, injects it as a
// Bearer token, and handles 401 → logout automatically.

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

// ── Token helpers ─────────────────────────────────────────────────────────────
export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem("eduplan_tokens") ?? "null");
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  localStorage.setItem("eduplan_tokens", JSON.stringify(tokens));
}

export function clearTokens() {
  localStorage.removeItem("eduplan_tokens");
  localStorage.removeItem("eduplan_user");
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("eduplan_user") ?? "null");
  } catch {
    return null;
  }
}

export function setUser(user) {
  localStorage.setItem("eduplan_user", JSON.stringify(user));
}

// ── Core request ─────────────────────────────────────────────────────────────
async function request(method, path, { body, isFormData = false, auth = true } = {}) {
  const headers = {};

  if (!isFormData) headers["Content-Type"] = "application/json";

  if (auth) {
    const tokens = getTokens();
    if (tokens?.access) headers["Authorization"] = `Bearer ${tokens.access}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
  });

  // Attempt token refresh on 401
  if (res.status === 401 && auth) {
    const tokens = getTokens();
    if (tokens?.refresh) {
      try {
        const refreshRes = await fetch(`${BASE_URL}/api/auth/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: tokens.refresh }),
        });
        if (refreshRes.ok) {
          const newTokens = await refreshRes.json();
          setTokens({ ...tokens, access: newTokens.access });
          // Retry original request with new token
          headers["Authorization"] = `Bearer ${newTokens.access}`;
          const retry = await fetch(`${BASE_URL}${path}`, {
            method,
            headers,
            body: isFormData ? body : body != null ? JSON.stringify(body) : undefined,
          });
          if (!retry.ok) {
            const err = await retry.json().catch(() => ({}));
            throw Object.assign(new Error(err?.detail ?? retry.statusText), { status: retry.status, data: err });
          }
          return retry.status === 204 ? null : retry.json();
        }
      } catch {
        // refresh failed — fall through to clear + throw
      }
    }
    clearTokens();
    window.location.href = "/auth/signin";
    throw new Error("Session expired. Please sign in again.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(err?.detail ?? err?.error ?? res.statusText),
      { status: res.status, data: err }
    );
  }

  return res.status === 204 ? null : res.json();
}

// ── Convenient methods ────────────────────────────────────────────────────────
export const api = {
  get:    (path, opts)        => request("GET",    path, opts),
  post:   (path, body, opts)  => request("POST",   path, { body, ...opts }),
  patch:  (path, body, opts)  => request("PATCH",  path, { body, ...opts }),
  delete: (path, opts)        => request("DELETE", path, opts),
};

export default api;
