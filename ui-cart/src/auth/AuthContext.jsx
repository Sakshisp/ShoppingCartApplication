import React, { createContext, useContext, useMemo, useState } from 'react';
import { axiosPublic, createAxiosPrivate } from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const AuthCtx = createContext(null);

// Simple storage: memory first, then localStorage as persistence
const TOKEN_KEY = 'accessToken';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');

  const isAuthed = !!token;
  const user = useMemo(() => {
    try { return token ? jwtDecode(token) : null; } catch { return null; }
  }, [token]);

  const login = async (username, password) => {
    const { data } = await axiosPublic.post('/auth/login', { username, password });
    const accessToken = data?.accessToken;
    if (!accessToken) throw new Error('No accessToken in response');

    setToken(accessToken);
    localStorage.setItem(TOKEN_KEY, accessToken);
    return true;
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem(TOKEN_KEY);
  };

  const axiosPrivate = useMemo(
    () => createAxiosPrivate(() => token, logout),
    [token]
  );

  const value = { isAuthed, user, token, login, logout, axiosPrivate };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
