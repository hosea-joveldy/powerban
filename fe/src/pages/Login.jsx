import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import "./auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Failed to log in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <Link to="/" className="brand-mark" aria-label="Powerban Home">
          <span className="brand-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="7" cy="12" r="5" fill="currentColor" />
              <circle cx="17" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </span>
          Powerban
        </Link>
        <Link to="/register" style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
          Sign Up
        </Link>
      </header>

      <div className="auth-card">
        <h1 className="auth-title">Log in</h1>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {/* Stacked input container matching references/login.png */}
          <div className="input-group-stacked">
            <div className="stacked-field">
              <label htmlFor="login-email" className="stacked-label">
                Email
              </label>
              <div className="stacked-input-row">
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  aria-label="email"
                  placeholder="yourname@email.com"
                  className="stacked-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="stacked-field">
              <label htmlFor="login-password" className="stacked-label">
                Password
              </label>
              <div className="stacked-input-row">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  aria-label="password"
                  placeholder="••••••••••••"
                  className="stacked-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="error-text" role="alert">{error}</div>}

          {/* Split action button matching references/login.png */}
          <button type="submit" className="btn-split-pill" disabled={busy} aria-label="Log in">
            <span className="split-pill-label">{busy ? "Logging in..." : "Log in"}</span>
            <span className="split-pill-arrow" aria-hidden="true">→</span>
          </button>
        </form>

        <p className="auth-terms">
          By signing in, you agree to the Terms of Use and Privacy Policy.
        </p>

        <div className="auth-footer-link">
          New user? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
