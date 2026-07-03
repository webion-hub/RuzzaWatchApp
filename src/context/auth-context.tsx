/**
 * Customer authentication state (Shopify Storefront customer API).
 *
 * The access token is persisted in AsyncStorage so the session survives
 * restarts. `token` is exposed so the cart can attach the customer (buyer
 * identity) for a personalized, account-linked checkout later on.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createCustomer,
  getCustomer,
  login as loginRequest,
  logout as logoutRequest,
  type SignUpInput,
} from '@/lib/customer';
import type { Customer, CustomerError } from '@/lib/types';

const TOKEN_KEY = 'ruzza-watch.customerToken';
const EXPIRES_KEY = 'ruzza-watch.customerTokenExpires';

type AuthResult = { ok: boolean; errors: CustomerError[] };

type AuthContextValue = {
  customer: Customer | null;
  token: string | null;
  isLoggedIn: boolean;
  /** Initial session hydration on launch. */
  loading: boolean;
  /** A sign-up / sign-in request is in flight. */
  busy: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const genericError = (message: string): CustomerError[] => [
  { code: null, field: null, message },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const persistToken = useCallback(
    async (accessToken: string, expiresAt: string) => {
      setToken(accessToken);
      await AsyncStorage.multiSet([
        [TOKEN_KEY, accessToken],
        [EXPIRES_KEY, expiresAt],
      ]);
    },
    [],
  );

  const clearToken = useCallback(async () => {
    setToken(null);
    setCustomer(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRES_KEY]);
  }, []);

  // Restore session on launch.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [[, saved], [, expires]] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          EXPIRES_KEY,
        ]);
        if (saved && (!expires || new Date(expires).getTime() > Date.now())) {
          const me = await getCustomer(saved);
          if (active && me) {
            setToken(saved);
            setCustomer(me);
          } else if (active) {
            await AsyncStorage.multiRemove([TOKEN_KEY, EXPIRES_KEY]);
          }
        }
      } catch {
        // ignore — user simply starts logged out
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      setBusy(true);
      try {
        const { token: t, errors } = await loginRequest(email, password);
        if (!t) return { ok: false, errors };
        await persistToken(t.accessToken, t.expiresAt);
        setCustomer(await getCustomer(t.accessToken));
        return { ok: true, errors: [] };
      } catch (err) {
        return { ok: false, errors: genericError((err as Error).message) };
      } finally {
        setBusy(false);
      }
    },
    [persistToken],
  );

  const signUp = useCallback(
    async (input: SignUpInput): Promise<AuthResult> => {
      setBusy(true);
      try {
        const { ok, errors } = await createCustomer(input);
        if (!ok) return { ok: false, errors };
        // Auto sign-in after successful registration.
        const { token: t, errors: loginErrors } = await loginRequest(
          input.email,
          input.password,
        );
        if (!t) return { ok: false, errors: loginErrors };
        await persistToken(t.accessToken, t.expiresAt);
        setCustomer(await getCustomer(t.accessToken));
        return { ok: true, errors: [] };
      } catch (err) {
        return { ok: false, errors: genericError((err as Error).message) };
      } finally {
        setBusy(false);
      }
    },
    [persistToken],
  );

  const signOut = useCallback(async () => {
    if (token) await logoutRequest(token);
    await clearToken();
  }, [token, clearToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      token,
      isLoggedIn: !!token && !!customer,
      loading,
      busy,
      signUp,
      signIn,
      signOut,
    }),
    [customer, token, loading, busy, signUp, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
