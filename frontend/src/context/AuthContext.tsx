import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, refreshToken: string, user: any) => void;
  logout: () => void;
  loading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('sprintnest_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  );

  useEffect(() => {
    // Synchronize HTML classes with the theme
    const root = window.document.documentElement;
    const body = window.document.body;
    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const fetchProfile = async () => {
    try {
      const profile = await api.get('/user/profile');
      setUser({
        ...profile,
        role: profile.role && typeof profile.role === 'object' ? profile.role.name : profile.role,
      });
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }

    const handleLogoutEvent = () => logout();
    window.addEventListener('auth_logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth_logout', handleLogoutEvent);
    };
  }, [token]);

  const login = (accessToken: string, refreshToken: string, userData: any) => {
    api.setTokens(accessToken, refreshToken);
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    api.clearTokens();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
