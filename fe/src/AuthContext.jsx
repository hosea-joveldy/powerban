import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";
import { DEFAULT_THEME, isValidTheme } from "./themes.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyTheme = (theme) => {
    const chosen = isValidTheme(theme) ? theme : DEFAULT_THEME;
    document.documentElement.dataset.theme = chosen;
    try {
      localStorage.setItem("powerban_theme", chosen);
    } catch (e) {}
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

  const login = useCallback(async (identifier, password) => {
    const u = await api.post("/auth/login", {
      username: identifier,
      email: identifier,
      password,
    });
    setUser(u);
    applyTheme(u.theme);
    return u;
  }, []);

  const register = useCallback(async (arg1, arg2, arg3) => {
    let payload;
    if (typeof arg1 === "object" && arg1 !== null) {
      payload = arg1;
    } else if (arg3 !== undefined) {
      payload = { username: arg1, email: arg2, password: arg3 };
    } else {
      payload = { email: arg1, password: arg2 };
    }
    const u = await api.post("/auth/register", payload);
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
