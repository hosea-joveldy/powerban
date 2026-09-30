import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { THEMES } from "../themes.js";
import TopBar from "../components/TopBar.jsx";

export default function Settings() {
  const { user, setTheme } = useAuth();

  return (
    <div className="page">
      <TopBar crumb="settings" />
      <div className="page-main" style={{ padding: "var(--space-5)", maxWidth: 640 }}>
        <h2 style={{ marginTop: 0 }}>Appearance</h2>
        <p style={{ color: "var(--text-dim)", marginTop: "-8px" }}>
          Pick a color scheme. Applies immediately and is saved to your account.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "var(--space-3)",
            marginTop: "var(--space-4)",
          }}
        >
          {THEMES.map((t) => {
            const active = user?.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-2)",
                  padding: "var(--space-3)",
                  textAlign: "left",
                  borderColor: active ? "var(--accent)" : "var(--border)",
                  borderWidth: active ? 2 : 1,
                  background: "var(--bg-pane)",
                }}
                aria-pressed={active}
              >
                <div style={{ display: "flex", gap: 4 }}>
                  {t.swatch.map((c, i) => (
                    <span
                      key={i}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 2,
                        background: c,
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    />
                  ))}
                </div>
                <span className="mono" style={{ fontSize: 13 }}>
                  {t.label}
                  {active && " ✓"}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ marginTop: "var(--space-5)" }}>
          <Link to="/">← back to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
