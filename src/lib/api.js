const API_BASE = (typeof window !== 'undefined' && window.EDUPLAN_API_BASE) || 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: options.credentials || 'same-origin',
    method: options.method || 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
  } catch {
    return { ok: res.ok, status: res.status, data: text };
  }
}

export async function apiRegister({ username, password, email, available_time = 60, goals = '' }) {
  return request('/register/', { method: 'POST', body: { username, password, email, available_time, goals } });
}

export async function apiLogin({ username, password }) {
  return request('/login/', { method: 'POST', body: { username, password } });
}

export default { apiRegister, apiLogin };
