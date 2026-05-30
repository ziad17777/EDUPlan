// src/Provider/AuthProvider.jsx
import { useState, useCallback } from "react";
import { AuthContext } from "@/store/auth-context";
import { getUser, getTokens, clearTokens } from "@/api/client";
import { logout as apiLogout } from "@/api/auth";

export default function AuthProvider({ children }) {
  const [user, setUserState] = useState(() => getUser());

  const isAuthenticated = !!user && !!getTokens()?.access;

  const login = useCallback((userData) => {
    setUserState(userData);
  }, []);

  const logout = useCallback(async () => {
    const tokens = getTokens();
    try {
      if (tokens?.refresh) await apiLogout(tokens.refresh);
    } catch {
      // ignore errors — clear locally regardless
    } finally {
      clearTokens();
      setUserState(null);
    }
  }, []);

  const setUser = useCallback((u) => setUserState(u), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
