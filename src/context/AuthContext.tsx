// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import type {ReactNode} from 'react';
import {jwtDecode} from 'jwt-decode';

interface User { id: number; username: string }
interface AuthCtx { user: User | null; token: string | null; login: (t:string,u:User)=>void; logout: ()=>void }
const AuthContext = createContext<AuthCtx>(null!);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token,setToken] = useState<string|null>(()=>localStorage.getItem('token'));
  const [user,setUser]   = useState<User|null>(()=>JSON.parse(localStorage.getItem('user')||'null'));

  
  useEffect(()=>{
    if (!token) return;
    const { exp }:{ exp:number } = jwtDecode(token);
    const ms = exp*1000 - Date.now();
    if (ms <= 0) logout();
    const id = setTimeout(logout, ms);
    return () => clearTimeout(id);
  },[token]);

  const login = (t:string) => {
    localStorage.setItem('token', t);
    setToken(t); 
  };

  const logout = () => {
    localStorage.clear();
    setToken(null); 
  };

  return <AuthContext.Provider value={{ user, token, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
