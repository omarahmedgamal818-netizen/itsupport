import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AuthUser } from '@workspace/api-client-react';

// Bump the suffix whenever the demo account list changes so stale sessions
// from a previous account set are dropped instead of showing an old identity.
const STORAGE_KEY = 'it-support-user-v2';

type AuthContextValue = {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: (next) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        setUser(next);
      },
      logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
