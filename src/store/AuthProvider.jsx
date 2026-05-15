import React, { useEffect, useState } from 'react';
import * as api from '@/lib/api';
import { AuthContext } from './auth';

export function AuthProvider({ children }){
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('eduplan_user')|| 'null'); } catch { return null; }
  });

  useEffect(()=>{
    localStorage.setItem('eduplan_user', JSON.stringify(user));
  },[user]);

  const signin = async ({ username, password }) => {
    const resp = await api.apiLogin({ username, password });
    if (resp.ok) {
      setUser({ username: resp.data.username, id: resp.data.user_id });
    }
    return resp;
  };

  const signup = async ({ name, email, password }) => {
    const resp = await api.apiRegister({ username: name, password, email });
    if (resp.ok) {
      setUser({ username: resp.data.username, id: resp.data.student_id });
    }
    return resp;
  };

  const signout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
