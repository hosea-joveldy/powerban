import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { DEFAULT_THEME, isValidTheme } from "./themes.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = isValidTheme(theme) ? theme : DEFAULT_THEME;
  };

  useEffect(() => {
    api
      .get("/me")
      .then((u) => {
        setUser(u);
        applyTheme(u.theme);
      })
      .catch(() => applyTheme(DEFAULT_THEME))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await api.post("/auth/login", { email, password });
    setUser(u);
    applyTheme(u.theme);
    return u;
  }, []);

  const register = useCallback(async (email, password) => {
    const u = await api.post("/auth/register", { email, password });
    setUser(u);
    applyTheme(u.theme);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout");
    setUser(null);
    applyTheme(DEFAULT_THEME);
  }, []);

  const setTheme = useCallback(async (theme) => {
    applyTheme(theme); // optimistic, feels instant
    const u = await api.patch("/me", { theme });
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
