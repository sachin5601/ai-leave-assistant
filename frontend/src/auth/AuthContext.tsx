
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, friendlyError } from "@/services/api";
import type { AuthSession, LoginCredentials } from "@/types";

const STORAGE_KEY = "hr-portal-session";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function loadSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw) as AuthSession;

    if (session.expiresAt && Date.now() > session.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return session;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const logoutInternal = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  // Restore session before allowing protected routes
  useEffect(() => {
    try {
      setSession(loadSession());
    } finally {
      setInitializing(false);
    }
  }, []);

  // Periodic session expiry check
  useEffect(() => {
    if (!session) return;

    const interval = setInterval(() => {
      if (session.expiresAt && Date.now() > session.expiresAt) {
        logoutInternal();
      }
    }, 60_000);

    return () => clearInterval(interval);
  }, [session, logoutInternal]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const newSession = await api.login(credentials);

        sessionStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(newSession)
        );

        setSession(newSession);
        return true;
      } catch (err) {
        setError(friendlyError(err));
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    logoutInternal();
  }, [logoutInternal]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      initializing,
      error,
      login,
      logout,
      clearError,
    }),
    [session, loading, initializing, error, login, logout, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return ctx;
}
