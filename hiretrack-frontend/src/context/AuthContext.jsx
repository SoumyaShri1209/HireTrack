import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshTimer          = useRef(null);

  // ── Schedule a proactive token refresh 1 min before expiry ──────
  const scheduleRefresh = useCallback((expiresInMs) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    const delay = Math.max(expiresInMs - 60_000, 10_000); // at least 10 s
    refreshTimer.current = setTimeout(async () => {
      try {
        const { data } = await authApi.refresh();
        localStorage.setItem('accessToken', data.accessToken);
        // Access tokens expire in 15 min → schedule next refresh
        scheduleRefresh(14 * 60 * 1000);
      } catch {
        // Refresh token also expired → force logout
        localStorage.removeItem('accessToken');
        setUser(null);
      }
    }, delay);
  }, []);

  // ── Rehydrate session on first load ─────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(({ data }) => {
        setUser(data.data);
        // Token was already present; schedule refresh in ~14 min
        scheduleRefresh(14 * 60 * 1000);
      })
      .catch(() => {
        // Token invalid or expired — try refresh before giving up
        return authApi.refresh()
          .then(({ data }) => {
            localStorage.setItem('accessToken', data.accessToken);
            return authApi.me();
          })
          .then(({ data }) => {
            setUser(data.data);
            scheduleRefresh(14 * 60 * 1000);
          })
          .catch(() => {
            localStorage.removeItem('accessToken');
          });
      })
      .finally(() => setLoading(false));

    return () => { if (refreshTimer.current) clearTimeout(refreshTimer.current); };
  }, [scheduleRefresh]);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data);
    scheduleRefresh(14 * 60 * 1000);
    return data;
  }, [scheduleRefresh]);

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data);
    scheduleRefresh(14 * 60 * 1000);
    return data;
  }, [scheduleRefresh]);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('accessToken');
    setUser(null);
  }, []);

  // ── Refresh user profile ─────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.data);
    } catch (_) {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
};
