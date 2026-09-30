import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      await register(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-4)",
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: 320,
          border: "1px solid var(--border)",
          background: "var(--bg-pane)",
          borderRadius: "var(--radius)",
          padding: "var(--space-5)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-3)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 18 }}>powerban</h1>
        <p style={{ margin: 0, color: "var(--text-dim)", fontSize: 13 }}>
          Create an account
        </p>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
        <input
          type="password"
          placeholder="password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="error-text">{error}</div>}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "creating..." : "create account"}
        </button>
        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>
          Already have one? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}
