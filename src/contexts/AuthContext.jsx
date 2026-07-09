import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from '../api/auth';
import toast from 'react-hot-toast';

// how long (ms) a closed session stays valid before auto-logout
const CLOSURE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

// localStorage key for the closure timestamp (sessionStorage is wiped on full browser exit)
const CLOSED_AT_KEY = 'moodiq_closed_at';
const TOKEN_KEY     = 'auth_token';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken]               = useState(null);
  const [user, setUser]                 = useState(null);
  const [loading, setLoading]           = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ref so the beforeunload handler always has the latest auth state
  const isAuthenticatedRef = useRef(false);
  isAuthenticatedRef.current = isAuthenticated;

  // guard against React StrictMode double-invoking the mount effect
  const initCalledRef = useRef(false);

  // ── 1. Closure-timer: write timestamp when the tab/window closes ────────
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isAuthenticatedRef.current) {
        // record when the user closed the page — use localStorage so it
        // survives a full browser exit and is readable on next open
        localStorage.setItem(CLOSED_AT_KEY, String(Date.now()));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // ── 2. On mount: check closure timer, then restore session ──────────────
  useEffect(() => {
    if (initCalledRef.current) return; // StrictMode guard
    initCalledRef.current = true;
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initAuth = async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (!storedToken) {
      // no token at all — not logged in
      setLoading(false);
      return;
    }

    // ── check the 10-minute closure window ──────────────────────────────
    const closedAtStr = localStorage.getItem(CLOSED_AT_KEY);
    if (closedAtStr) {
      const closedAt = parseInt(closedAtStr, 10);
      const elapsed  = Date.now() - closedAt;

      // remove the marker regardless — it's a one-shot check per open
      localStorage.removeItem(CLOSED_AT_KEY);

      if (elapsed > CLOSURE_TIMEOUT_MS) {
        // user was away for more than 10 minutes — clear session
        clearSession();
        setLoading(false);
        return;
      }
      // within the window — fall through to normal token validation
    }

    // ── validate the JWT locally (no network needed) ─────────────────────
    let decoded;
    try {
      decoded = jwtDecode(storedToken);
    } catch {
      // malformed token
      clearSession();
      setLoading(false);
      return;
    }

    if (decoded.exp * 1000 < Date.now()) {
      // JWT itself has expired (typically 30-day window from our backend)
      clearSession();
      setLoading(false);
      return;
    }

    // token is locally valid — optimistically mark as authenticated and stop
    // blocking the UI immediately (no network round-trip before render)
    setToken(storedToken);
    setIsAuthenticated(true);
    setLoading(false); // ← unblock the router NOW, profile loads in background

    // ── fetch user profile from the server in the background ─────────────
    try {
      await fetchUserProfile();
    } catch (err) {
      const status = err.response?.status;

      if (status === 401 || status === 403 || status === 404) {
        // server explicitly rejected the token — clear everything
        clearSession();
      }
      // for network errors / 5xx (cold-start), keep the user logged in;
      // the JWT is locally valid and other API calls will work once server wakes
    }
  };

  // ── helpers ─────────────────────────────────────────────────────────────

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CLOSED_AT_KEY); // clear closure timer too
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const fetchUserProfile = async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    return userData;
  };

  // ── handleLogin ──────────────────────────────────────────────────────────
  const handleLogin = async (newToken) => {
    if (!newToken || typeof newToken !== 'string') {
      throw new Error('Invalid token format');
    }

    let decoded;
    try {
      decoded = jwtDecode(newToken);
    } catch {
      throw new Error('Could not decode token');
    }

    if (decoded.exp * 1000 < Date.now()) {
      throw new Error('Token already expired');
    }

    localStorage.setItem(TOKEN_KEY, newToken);
    // clear any stale closure timer from a previous session
    localStorage.removeItem(CLOSED_AT_KEY);
    setToken(newToken);

    try {
      const userData = await fetchUserProfile();
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${userData.displayName}!`, {
        id: 'login-success',
        duration: 3000,
      });

      return userData;
    } catch (err) {
      clearSession();
      toast.error('Login failed. Please try again.', { id: 'login-error', duration: 4000 });
      throw err;
    }
  };

  // ── handleLogout ─────────────────────────────────────────────────────────
  const handleLogout = () => {
    clearSession();
    window.location.href = '/';
  };

  // ── updateUser / refreshUser ─────────────────────────────────────────────
  const updateUser  = (updates) => setUser(prev => ({ ...prev, ...updates }));

  const refreshUser = async () => {
    const userData = await fetchUserProfile();
    return userData;
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    login: handleLogin,
    logout: handleLogout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};