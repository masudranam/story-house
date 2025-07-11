import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';

interface User {
  userId: string;
  username: string;
  role: number;
}

interface TokenPayload {
  userId: string;
  username: string;
  role: number;
  exp?: number;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  login: (t: string, rememberMe?: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      const now = Date.now() / 1000;
      if (decoded.exp && decoded.exp < now) {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.error('Session expired. Please log in again.');
        return;
      }
      setUser({
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
      });
      if (decoded.exp) {
        const ms = decoded.exp * 1000 - Date.now();
        const id = setTimeout(() => {
          logout();
          toast.error('Session expired. Please log in again.');
        }, ms);
        return () => clearTimeout(id);
      }
    } catch (err) {
      console.error('Token decode error:', err);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setToken(null);
      setUser(null);
      toast.error('Invalid token. Please log in again.');
    }
  }, [token]);

  const login = (t: string, rememberMe: boolean = true) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', t);
    setToken(t);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully.');
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};