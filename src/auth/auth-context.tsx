import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getCurrentUser, logout as logoutRequest } from '@workspace/api-client-react';


type AuthUser = Record<string, any> | null;
export type AuthContextValue = {
  user: AuthUser;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<AuthUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authRequestId = useRef(0);

  const refresh = useCallback(async () => {
    const requestId = ++authRequestId.current;
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (requestId === authRequestId.current) setUser(currentUser);
      return currentUser;
    } catch {
      if (requestId === authRequestId.current) setUser(null);
      return null;
    } finally {
      if (requestId === authRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('error');
    const token = params.get('token') || params.get('access_token');
    if (token) {
      try { sessionStorage.setItem('enrg_token', token); } catch { /* OAuth also establishes the HttpOnly session cookie. */ }
    }
    if (authError) setError(authError === 'access_denied' ? 'Google sign-in was cancelled. You can try again whenever you are ready.' : 'Google sign-in could not be completed. Please try again.');
    if (authError || token) window.history.replaceState({}, '', `${window.location.pathname}${window.location.hash}`);
    const syncAuth = () => void refresh();
    window.addEventListener('enrg-auth-changed', syncAuth);
    window.addEventListener('storage', syncAuth);
    void refresh();
    return () => {
      window.removeEventListener('enrg-auth-changed', syncAuth);
      window.removeEventListener('storage', syncAuth);
    };
  }, [refresh]);

  const signOut = useCallback(async () => {
    // Ignore any auth bootstrap request that began before logout completed.
    authRequestId.current += 1;
    setUser(null);
    try {
      await logoutRequest();
    } catch {
    } finally {
      authRequestId.current += 1;
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, error, refresh, signOut }), [user, loading, error, refresh, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const getAccountPath = (user: AuthUser) => ['user', 'customer'].includes(user?.role) ? '/customer/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/company/dashboard';

export function getAuthReturnTo(user: AuthUser, returnTo?: string | null) {
  const accountPath = getAccountPath(user);
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) return accountPath;

  const pathname = returnTo.split(/[?#]/, 1)[0];
  if (['/signin', '/signup', '/register'].includes(pathname)) return accountPath;

  const allowed = user?.role === 'user' || user?.role === 'customer'
    ? pathname === '/quote' || pathname === '/dashboard' || pathname.startsWith('/customer/')
    : user?.role === 'admin'
      ? pathname === '/dashboard' || pathname.startsWith('/admin/')
      : pathname === '/dashboard' || pathname.startsWith('/company/');

  return allowed ? returnTo : accountPath;
}
export const notifyAuthChanged = () => window.dispatchEvent(new Event('enrg-auth-changed'));
