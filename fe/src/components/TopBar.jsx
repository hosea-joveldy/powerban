import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function TopBar({ crumb }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
        <Link to="/" className="wordmark" style={{ color: "var(--text)" }}>
          powerban
        </Link>
        {crumb && <span style={{ color: "var(--text-dim)" }}>/ {crumb}</span>}
      </div>
      <div className="actions">
        <Link to="/settings" className="icon-btn" title="Settings" aria-label="Settings">
          ⚙
        </Link>
        <button
          className="icon-btn"
          title="Log out"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          ⏻
        </button>
      </div>
    </div>
  );
}
