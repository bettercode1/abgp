import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getFirebaseAuth } from '../lib/firebaseClient';
import { getUserRoleAndPrantFromUser, isFirebaseConfigured } from '../lib/firebase';

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

function applySessionUser(
  sessionUser: { email?: string | null },
  role: string | null,
  prant: string | null
): AuthUser | null {
  const email = sessionUser.email ?? '';
  const r = (role === 'director' || role === 'prant' ? role : 'member') as LoginRole;
  return { role: r, email, prant: prant ?? undefined };
}

async function syncFirebaseUser(firebaseUser: User): Promise<{ user: AuthUser; token: string } | null> {
  const { role, prant } = await getUserRoleAndPrantFromUser(firebaseUser);
  const token = await firebaseUser.getIdToken();
  const user = applySessionUser(firebaseUser, role, prant);
  if (!user) return null;
  return { user, token };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const useFirebase = isFirebaseConfigured();
  const [authLoading, setAuthLoading] = useState(useFirebase);

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (useFirebase) return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as AuthUser;
    } catch {
      // ignore
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() =>
    useFirebase ? null : localStorage.getItem(TOKEN_STORAGE_KEY)
  );

  useEffect(() => {
    if (!useFirebase) {
      setAuthLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    if (!auth) {
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      if (firebaseUser) {
        try {
          const synced = await syncFirebaseUser(firebaseUser);
          if (cancelled || !synced) return;
          setUser(synced.user);
          setToken(synced.token);
        } catch {
          if (!cancelled) {
            setUser(null);
            setToken(null);
          }
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setAuthLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [useFirebase]);

  useEffect(() => {
    if (useFirebase || !user) return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  }, [useFirebase, user]);

  useEffect(() => {
    if (useFirebase) return;
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  }, [useFirebase, token]);

  const login = useCallback((userData: AuthUser, authToken?: string) => {
    setUser(userData);
    setToken(authToken ?? null);
  }, []);

  const logout = useCallback(() => {
    if (useFirebase) {
      const auth = getFirebaseAuth();
      if (auth) signOut(auth);
    }
    setUser(null);
    setToken(null);
  }, [useFirebase]);

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
