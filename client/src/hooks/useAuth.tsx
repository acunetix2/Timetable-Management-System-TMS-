import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { useToast } from './use-toast';

type AuthContextType = {
  user: any | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: string) => Promise<any>;
  setToken: (token: string | null, user?: any | null) => Promise<any | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchMe = async (token: string) => {
    try {
      apiClient.setToken(token);
      const data = await apiClient.getMe();
      setUser(data.user);
      return data.user;
    } catch (e) {
      setUser(null);
      apiClient.clearToken();
      localStorage.removeItem('auth_token');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      (async () => {
        const u = await fetchMe(token);
        try {
          const path = window.location.pathname;
          if (u && (path === '/' || path === '/login' || path === '/register')) {
            if (u.role === 'lecturer') navigate('/lecturer/dashboard');
            else if (u.role === 'admin') navigate('/admin/dashboard');
            else navigate('/student/dashboard');
          }
        } catch (e) {
          // ignore navigation errors
        }
      })();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setToken = async (token: string | null, userOverride?: any | null) => {
    if (token) {
      localStorage.setItem('auth_token', token);
      apiClient.setToken(token);
      if (userOverride) {
        setUser(userOverride);
        setLoading(false);
        return userOverride;
      }
      return await fetchMe(token);
    } else {
      localStorage.removeItem('auth_token');
      apiClient.clearToken();
      setUser(null);
      return null;
    }
  };

  const login = async (email: string, password: string, role: string) => {
    try {
      const data = await apiClient.login(email, password, role);
      if (data.access_token) {
        await setToken(data.access_token, data.user);
        return data.user;
      }
      throw new Error('No token received');
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    setToken(null);
    toast({ title: 'Signed out', description: 'You have been logged out.' });
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
