import React from 'react';
import type { User } from '../types';
import { clearAuthToken, getAuthToken, getStoredString, setAuthToken } from '../storage/authToken';
import { setApiBaseUrlOverride } from '../config';
import { getProfile } from '../api/auth';

const API_BASE_URL_KEY = 'api_base_url';

type AuthState = {
  token: string | null;
  user: User | null;
  bootstrapped: boolean;
};

type AuthContextValue = AuthState & {
  signIn: (input: { token: string; user?: User | null }) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AuthState>({
    token: null,
    user: null,
    bootstrapped: false,
  });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [token, apiBaseUrl] = await Promise.all([
          getAuthToken(),
          getStoredString(API_BASE_URL_KEY),
        ]);
        if (cancelled) return;
        setApiBaseUrlOverride(apiBaseUrl);
        if (token) {
          try {
            const profile = await getProfile(token);
            if (!cancelled) setState({ token, user: profile, bootstrapped: true });
            return;
          } catch {}
        }
        setState((prev) => ({ ...prev, token: token ?? null, bootstrapped: true }));
      } catch {
        if (cancelled) return;
        setState((prev) => ({ ...prev, bootstrapped: true }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = React.useCallback(async (input: { token: string; user?: User | null }) => {
    try {
      await setAuthToken(input.token);
    } catch {}
    setState({ token: input.token, user: input.user ?? null, bootstrapped: true });
  }, []);

  const signOut = React.useCallback(async () => {
    try {
      await clearAuthToken();
    } catch {}
    setState({ token: null, user: null, bootstrapped: true });
  }, []);

  const setUser = React.useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
      setUser,
    }),
    [state, signIn, signOut, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
