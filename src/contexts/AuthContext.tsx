import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getSupabase, getUserRoleAndPrant, isSupabaseConfigured } from '../lib/supabase';

export type LoginRole = 'member' | 'director' | 'prant';

export interface AuthUser {
  role: LoginRole;
  email: string;
  name?: string;
  isNewMember?: boolean;
  prant?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
}

const AUTH_STORAGE_KEY = 'abgp-auth-user';
const TOKEN_STORAGE_KEY = 'abgp-auth-token';

const AuthContext = createContext<AuthContextValue | null>(null);

function applySessionUser(sessionUser: { id: string; email?: string }, role: string | null, prant: string | null): AuthUser | null {
  const email = sessionUser.email ?? '';
  const r = (role === 'director' || role === 'prant' ? role : 'member') as LoginRole;
  return { role: r, email, prant: prant ?? undefined };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const useSupabase = isSupabaseConfigured();
  const [authLoading, setAuthLoading] = useState(useSupabase);

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (useSupabase) return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as AuthUser;
    } catch {
      // ignore
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => (useSupabase ? null : localStorage.getItem(TOKEN_STORAGE_KEY)));

  useEffect(() => {
    if (!useSupabase) {
      setAuthLoading(false);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    let cancelled = false;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        setToken(session.access_token ?? null);
        getUserRoleAndPrant(session.user.id).then(({ role, prant }) => {
          if (cancelled) return;
          const u = applySessionUser(session.user, role, prant);
          setUser(u);
        });
      } else {
        setUser(null);
        setToken(null);
      }
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setToken(session.access_token ?? null);
        getUserRoleAndPrant(session.user.id).then(({ role, prant }) => {
          if (cancelled) return;
          setUser(applySessionUser(session.user, role, prant));
        });
      } else {
        setUser(null);
        setToken(null);
      }
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [useSupabase]);

  useEffect(() => {
    if (useSupabase || !user) return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }, [useSupabase, user]);

  useEffect(() => {
    if (useSupabase) return;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [useSupabase, token]);

  const login = useCallback((userData: AuthUser, authToken?: string) => {
    setUser(userData);
    setToken(authToken ?? null);
  }, []);

  const logout = useCallback(() => {
    if (useSupabase) {
      const supabase = getSupabase();
      supabase?.auth.signOut();
    }
    setUser(null);
    setToken(null);
  }, [useSupabase]);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user,
    authLoading,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
