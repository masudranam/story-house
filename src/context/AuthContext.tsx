 
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User { userId: string; username: string , role: number}
interface AuthCtx { user: User | null; token: string | null; login: (t: string) => void; logout: () => void }
const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => JSON.parse(localStorage.getItem('user') || 'null'));


  useEffect(() => {
    if (!token) return;
    const { exp, user: tokenUser }: { exp: number, user: User } = jwtDecode(token);
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) logout();
    const id = setTimeout(logout, ms);
    setUser(tokenUser)
    return () => clearTimeout(id);
  }, [token]);

  const login = (t: string) => {
    localStorage.setItem('token', t);

    if (!token) return;
    const { exp, user: tokenUser }: { exp: number, user: User } = jwtDecode(t);
    const ms = exp * 1000 - Date.now();
    if (ms <= 0) logout();
    const id = setTimeout(logout, ms);
    setUser(tokenUser)

    setToken(t);
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
