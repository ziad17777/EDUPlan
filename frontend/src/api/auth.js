// src/api/auth.js
import api, { setTokens, setUser, clearTokens } from "./client";

export async function login({ email, password }) {
  const data = await api.post("/api/auth/login/", { email, password }, { auth: false });
  setTokens({ access: data.access, refresh: data.refresh });
  setUser(data.user);
  return data;
}

export async function register({ first_name, last_name, email, password, password_confirm }) {
  const data = await api.post("/api/auth/register/", {
    first_name, last_name, email, password, password_confirm,
  }, { auth: false });
  setTokens({ access: data.tokens.access, refresh: data.tokens.refresh });
  setUser(data.user);
  return data;
}

export async function logout(refreshToken) {
  try {
    await api.post("/api/auth/logout/", { refresh: refreshToken });
  } finally {
    clearTokens();
  }
}

export async function getProfile() {
  return api.get("/api/auth/profile/");
}
