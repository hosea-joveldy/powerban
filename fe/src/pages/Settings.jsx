import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";
import { THEMES } from "../themes.js";
import TopBar from "../components/TopBar.jsx";
import "./settings.css";

const THEME_DESCRIPTIONS = {
  "stone-light": "Clean, editorial light environment with sage accents",
  "forest-dark": "Deep nocturnal dark space with vibrant lime glow",
};

export default function Settings() {
  const { user, setTheme } = useAuth();

  return (
    <div className="settings-page page">
      <TopBar crumb="settings" />
      <main className="settings-container page-main">
        <div className="settings-card">
          <h1 className="settings-title">Appearance</h1>
          <p className="settings-description">
            Pick a color scheme. Applies immediately and is saved to your account.
          </p>

          <div className="theme-options-grid">
            {THEMES.map((t) => {
              const active = user?.theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`theme-option-card ${active ? "active" : ""}`}
                  aria-pressed={active}
                >
                  <div className="theme-swatches" aria-hidden="true">
                    {t.swatch.map((c, i) => (
                      <span
                        key={i}
                        className="theme-swatch-circle"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="theme-card-info">
                    <div className="theme-card-header">
                      <span className="theme-card-name">{t.label}</span>
                      {active && <span className="theme-active-tag">Active</span>}
                    </div>
                    <span className="theme-card-desc">
                      {THEME_DESCRIPTIONS[t.id] || "Unified theme palette"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <Link to="/" className="settings-back-link">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
