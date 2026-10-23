import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import HeroOrbitCanvas from "../components/HeroOrbitCanvas.jsx";
import logoDarkSvg from "../assets/logo-dark.svg";
import "./landing.css";

export default function LandingPage() {
  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", `#${targetId}`);
    }
  };

  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-nav">
        <Link to="/" className="brand-mark" aria-label="Powerban Home">
          <img
            src={logoDarkSvg}
            alt="Powerban"
            className="brand-logo-img"
            style={{ height: "26px", width: "auto", display: "block" }}
          />
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a href="#features" onClick={(e) => handleNavClick(e, "features")}>Features</a>
            </li>
            <li>
              <a href="#workflow" onClick={(e) => handleNavClick(e, "workflow")}>Workflow</a>
            </li>
            <li>
              <a href="#bento" onClick={(e) => handleNavClick(e, "bento")}>Highlights</a>
            </li>
            <li>
              <a href="#templates" onClick={(e) => handleNavClick(e, "templates")}>Templates</a>
            </li>
            <li>
              <a href="#architecture" onClick={(e) => handleNavClick(e, "architecture")}>Architecture</a>
            </li>
          </ul>
        </nav>

        <div className="nav-cta">
          <a
            href="https://github.com/hosea-joveldy/powerban"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-github-nav"
            aria-label="GitHub Repository"
            title="View Powerban on GitHub"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <Link to="/login" className="btn-pill-primary">
            Get started
            <span className="btn-status-dot" aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Section 1: Hero */}
      <section className="landing-hero" id="hero">
        <HeroOrbitCanvas />

        <div className="hero-content">
          <h1 className="hero-title">
            Introducing Powerban:
            <br />
            The focused kanban
            <br />
            <em>for power users</em>
          </h1>

          <p className="hero-subtitle">
            Create multiple boards, organize them into groups, link tasks to track
            cross-project progress in real time, and protect your focus with strict WIP limits.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="btn-pill-primary">
              Try it now
              <span className="btn-status-dot" aria-hidden="true" />
            </Link>
            <a href="#features" onClick={(e) => handleNavClick(e, "features")} className="btn-pill-secondary">
              Learn more
              <span className="btn-status-dot" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Product Showcase (references/landing-page-section2.png) */}
      <section className="landing-section-2" id="features">
        <div className="showcase-grid">
          <div className="showcase-card">
            <h2 className="showcase-card-title">Workspaces &amp; Groups</h2>
            <p className="showcase-card-text">
              Organize unlimited boards into logical workspaces and groups. Keep client
              deliverables, sprints, and personal milestones cleanly partitioned without
              cognitive clutter or unnecessary layers.
            </p>
          </div>

          <div className="showcase-card">
            <h2 className="showcase-card-title">Linked Boards &amp; Progress</h2>
            <p className="showcase-card-text">
              Link any task directly to another board to track execution in real time.
              Progress bars compute flat completion percentages across your entire project
              tree at a glance.
            </p>
          </div>
        </div>

        {/* Feature Spotlight Row */}
        <div className="feature-spotlight" id="workflow">
          <div className="spotlight-content">
            <span className="spotlight-badge">Power user flow</span>
            <h2 className="spotlight-title">Build with Powerban</h2>
            <p className="spotlight-text">
              Strict WIP limits on active cards eliminate multitasking bottlenecks.
              Completed cards automatically mark tasks finished, and board templates enable
              instant repeatable workflows.
            </p>
            <div className="spotlight-actions">
              <Link to="/login" className="btn-pill-primary">
                Open Board
                <span className="btn-status-dot" aria-hidden="true" />
              </Link>
              <Link to="/login" className="btn-pill-secondary">
                Templates
                <span className="btn-status-dot" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="spotlight-graphic" aria-hidden="true">
            <svg
              width="420"
              height="280"
              viewBox="0 0 420 280"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Perspective dot-funnel orbits matching reference section 2 */}
              <circle cx="160" cy="140" r="5" fill="var(--btn-primary-bg)" />
              <ellipse
                cx="190"
                cy="140"
                rx="24"
                ry="44"
                stroke="var(--border-strong)"
                strokeDasharray="2 4"
                strokeWidth="1.5"
              />
              <ellipse
                cx="230"
                cy="140"
                rx="48"
                ry="72"
                stroke="var(--border-strong)"
                strokeDasharray="2 4"
                strokeWidth="1.5"
              />
              <ellipse
                cx="280"
                cy="140"
                rx="76"
                ry="105"
                stroke="var(--border-strong)"
                strokeDasharray="2 5"
                strokeWidth="1.5"
              />
              <ellipse
                cx="340"
                cy="140"
                rx="110"
                ry="135"
                stroke="var(--border-strong)"
                strokeDasharray="3 6"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Bento Box Highlights Section */}
      <section className="landing-bento-section" id="bento">
        <div className="bento-header">
          <span className="bento-header-badge">Precision Engineering</span>
          <h2 className="bento-header-title">Engineered for Velocity &amp; Deep Focus</h2>
          <p className="bento-header-desc">
            Powerban unifies strict kanban discipline with nested hierarchical cards and multi-entity dragging—eliminating cognitive clutter and bottlenecked sprints.
          </p>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1 (Span 2) */}
          <div className="bento-card span-2">
            <div className="bento-card-meta">
              <span className="bento-card-tag">Hierarchy</span>
              <h3 className="bento-card-title">Nested Sub-Cards &amp; Sub-Boards</h3>
              <p className="bento-card-desc">
                Embed cards inside cards and boards inside cards. Enforce complete resolution: a nested card or board task can only transition to Completed when all its internal items are completely cleared.
              </p>
            </div>
            <div className="bento-preview">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>TASK ITEM: CARD B</span>
                <span className="wip-indicator-pill" style={{ background: "var(--bg-surface-subtle)", color: "var(--text-secondary)" }}>Card Entity</span>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Refactor Database Driver</span>
                <span className="section-count-badge" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 3 }}>
                  0 items (Empty <Check size={12} />)
                </span>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                Ready to move into Completed lane. All child constraints satisfied.
              </div>
            </div>
          </div>

          {/* Bento Card 2 */}
          <div className="bento-card">
            <div className="bento-card-meta">
              <span className="bento-card-tag">Workspace</span>
              <h3 className="bento-card-title">Vertical Focus Mode</h3>
              <p className="bento-card-desc">
                Collapse non-urgent columns into a slim 54px vertical spine with 90° rotated typography. Reclaim board real estate instantly.
              </p>
            </div>
            <div className="bento-preview" style={{ alignItems: "center", justifyContent: "center", height: "100px" }}>
              <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-muted)" }}>
                COLLAPSED LANE
              </div>
            </div>
          </div>

          {/* Bento Card 3 */}
          <div className="bento-card">
            <div className="bento-card-meta">
              <span className="bento-card-tag">Discipline</span>
              <h3 className="bento-card-title">Universal WIP Limits</h3>
              <p className="bento-card-desc">
                Set custom capacity constraints on any active lane—not just ongoing. Protect attention and prevent bottlenecking before it happens.
              </p>
            </div>
            <div className="bento-preview" style={{ alignItems: "center", justifyContent: "center" }}>
              <span className="wip-indicator-pill at-limit" style={{ fontSize: "var(--text-sm)", padding: "4px 14px" }}>
                3/3 CAP REACHED
              </span>
            </div>
          </div>

          {/* Bento Card 4 (Span 2) */}
          <div className="bento-card span-2">
            <div className="bento-card-meta">
              <span className="bento-card-tag">Interaction</span>
              <h3 className="bento-card-title">Conflict-Free Multi-Entity Drag &amp; Drop</h3>
              <p className="bento-card-desc">
                Reorder columns horizontally without accidental task dragging. Move boards across groups or detach into standalone workspaces on your dashboard with fluid collision feedback.
              </p>
            </div>
            <div className="bento-preview">
              <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
                <span className="mono" style={{ fontSize: "var(--text-xs)", padding: "4px 8px", background: "var(--bg-surface)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)" }}>⠿ Column Handle</span>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>→ Isolated drag hitbox</span>
                <span className="mono" style={{ fontSize: "var(--text-xs)", padding: "4px 8px", background: "var(--bg-surface)", borderRadius: "var(--radius-xs)", border: "1px solid var(--border-default)", marginLeft: "auto" }}>Task Drag</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Dark Showcase Banner (references/landing-page-section3.png) */}
      <section className="landing-section-3" id="templates">
        <div className="dark-banner">
          <div className="banner-content">
            <h2 className="banner-title">
              Build the future of
              <br />
              focused work
            </h2>
            <p className="banner-text">
              Designed for builders and power users who value speed and clarity. No trackers,
              no bloated widgets—just pure keyboard-friendly kanban efficiency with flat progress rollup.
            </p>
            <Link to="/login" className="btn-pill-lime">
              Get started
              <span className="btn-status-dot" aria-hidden="true" />
            </Link>
          </div>

          <div className="banner-apertures" aria-hidden="true">
            {/* Aperture 1: Flow / Highway graphic */}
            <div className="aperture aperture-1">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#2d3b22" />
                <path d="M 0 50 Q 50 0 100 50" stroke="#758c5c" strokeWidth="6" fill="none" />
                <path d="M 50 0 Q 100 50 50 100" stroke="#8da870" strokeWidth="6" fill="none" />
                <path d="M 0 30 Q 70 50 100 70" stroke="#c8db57" strokeWidth="4" fill="none" />
              </svg>
            </div>

            {/* Aperture 2: Nebula / Focus graphic */}
            <div className="aperture aperture-2">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#141f10" />
                <circle cx="50" cy="50" r="35" fill="rgba(200, 219, 87, 0.15)" />
                <circle cx="65" cy="40" r="22" fill="rgba(117, 140, 92, 0.25)" />
                <circle cx="35" cy="60" r="18" fill="rgba(200, 219, 87, 0.3)" />
              </svg>
            </div>

            {/* Aperture 3: Structure / Architectural skyline */}
            <div className="aperture aperture-3">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#1f2c16" />
                <rect x="15" y="45" width="18" height="55" fill="#384c2b" />
                <rect x="38" y="30" width="24" height="70" fill="#506b3e" />
                <rect x="67" y="52" width="20" height="48" fill="#384c2b" />
                <circle cx="50" cy="22" r="3" fill="#c8db57" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="about">
        <div>Powerban &bull; Open-source kanban for power users (MIT License)</div>
        <div className="footer-links">
          <Link to="/login">Log in</Link>
          <Link to="/register">Register</Link>
          <a
            href="https://github.com/hosea-joveldy/powerban"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
