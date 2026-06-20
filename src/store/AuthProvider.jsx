import React, { useEffect, useState } from 'react';
import { authLogin, authRegister, authLogout, saveTokens, clearStoredTokens, getStoredTokens, apiRequest } from '@/lib/api';
import { AuthContext } from './auth';

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduplan_user')|| 'null'); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // persist user to localStorage when it changes
  useEffect(()=>{
    localStorage.setItem('eduplan_user', JSON.stringify(user));
  },[user]);

  // on mount: try to restore user from stored tokens by fetching profile
  useEffect(() => {
    const restore = async () => {
      const tokens = getStoredTokens();
      if (!tokens || !tokens.access) {
        setLoading(false);
        return;
      }
      try {
        const resp = await apiRequest('/auth/profile/');
        if (resp.ok && resp.data) {
          setUser(resp.data);
        }
      } catch {
        // silent fail — user will stay null and can sign in again
      }
      setLoading(false);
    };
    restore();
  }, []);

  const signin = async ({ email, password }) => {
    const resp = await authLogin({ email, password });
    if (resp.ok && resp.data) {
      // backend returns { refresh, access, user: UserProfile }
      const { access, refresh, user: userProfile } = resp.data;
      if (access || refresh) {
        saveTokens({ access, refresh });
      }
      setUser(userProfile || { email });
    }
    return resp;
  };

  const signup = async ({ email, firstName, lastName, password, passwordConfirm }) => {
    const resp = await authRegister({ email, firstName, lastName, password, passwordConfirm });
    if (resp.ok && resp.data) {
      // backend returns { message, user, tokens: { access, refresh } }
      const { tokens, user: userProfile } = resp.data;
      if (tokens) {
        saveTokens(tokens);
      }
      setUser(userProfile || { email });
    }
    return resp;
  };

  const signout = async () => {
    try {
      const tokens = getStoredTokens();
      if (tokens && tokens.refresh) {
        await authLogout(tokens.refresh);
      } else {
        clearStoredTokens();
      }
    } catch {
      clearStoredTokens();
    }
    setUser(null);
  };

  // fetch or refresh the user profile from server
  const refreshProfile = async () => {
    try {
      const resp = await apiRequest('/auth/profile/');
      if (resp.ok && resp.data) {
        setUser(resp.data);
        return resp.data;
      }
    } catch {
      // silent
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
