const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

const TOKENS_KEY = 'eduplan_tokens';

function readTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || 'null');
  } catch {
    return null;
  }
}

export function getStoredTokens(){
  return readTokens();
}

function writeTokens(tokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

function clearTokens() {
  localStorage.removeItem(TOKENS_KEY);
}

async function rawFetch(url, opts = {}) {
  return fetch(url, opts);
}

async function request(path, { method = 'GET', body, headers = {}, skipAuth = false } = {}) {
  const url = `${API_BASE}${path}`;

  const baseHeaders = { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers };

  const tokens = readTokens();
  if (!skipAuth && tokens && tokens.access) {
    baseHeaders['Authorization'] = `Bearer ${tokens.access}`;
  }

  const res = await rawFetch(url, {
    method,
    headers: baseHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // if unauthorized and we have a refresh token, try refresh once
  if (res.status === 401 && tokens && tokens.refresh) {
    const refreshed = await tryRefresh(tokens.refresh);
    if (refreshed) {
      // retry original request with new access token
      const newTokens = readTokens();
      if (newTokens && newTokens.access) baseHeaders['Authorization'] = `Bearer ${newTokens.access}`;
      const retry = await rawFetch(url, {
        method,
        headers: baseHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });
      return parseResponse(retry);
    }
  }

  return parseResponse(res);
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

async function tryRefresh(refreshToken) {
  try {
    const url = `${API_BASE}/auth/token/refresh/`;
    const res = await rawFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = await res.json();
    // data should contain { access: '...' }
    const prev = readTokens() || {};
    const merged = { ...prev, access: data.access };
    writeTokens(merged);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

// Auth endpoints
export async function authRegister({ email, firstName, lastName, password, passwordConfirm }) {
  return request('/auth/register/', {
    method: 'POST',
    body: { email, first_name: firstName, last_name: lastName, password, password_confirm: passwordConfirm },
    skipAuth: true,
  });
}

export async function authLogin({ email, password }) {
  return request('/auth/login/', { method: 'POST', body: { email, password }, skipAuth: true });
}

export async function authRefresh(refresh) {
  return request('/auth/token/refresh/', { method: 'POST', body: { refresh }, skipAuth: true });
}

export async function authLogout(refreshToken) {
  const result = await request('/auth/logout/', { method: 'POST', body: { refresh: refreshToken } });
  clearTokens();
  return result;
}

// Perform a fetch with Authorization header from stored tokens.
// If the response is 401 and a refresh token exists, try refresh once and retry the request.
// Returns the raw Fetch Response object.
export async function authedFetch(input, init = {}) {
  const url = input.startsWith('http') ? input : `${API_BASE}${input}`;
  const tokens = readTokens();

  const headers = { ...(init.headers || {}) };
  if (tokens && tokens.access) headers['Authorization'] = `Bearer ${tokens.access}`;

  let res = await rawFetch(url, { ...init, headers });

  if (res.status === 401 && tokens && tokens.refresh) {
    // try to refresh
    const r = await authRefresh(tokens.refresh);
    if (r && r.ok && r.data && r.data.access) {
      // save new access and retry
      const merged = { ...(readTokens() || {}), access: r.data.access };
      writeTokens(merged);
      const retryHeaders = { ...(init.headers || {}), Authorization: `Bearer ${r.data.access}` };
      res = await rawFetch(url, { ...init, headers: retryHeaders });
      return res;
    }
    // refresh failed -> clear tokens to force sign-in
    clearTokens();
  }

  return res;
}

// Generic API helper
export async function apiRequest(path, opts) {
  return request(path, opts);
}

export function saveTokens(tokens) {
  writeTokens(tokens);
}

export function clearStoredTokens() {
  clearTokens();
}

export default { authRegister, authLogin, authRefresh, authLogout, apiRequest, saveTokens, clearStoredTokens };
