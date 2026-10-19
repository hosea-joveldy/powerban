import { Link } from "react-router-dom";
import HeroOrbitCanvas from "../components/HeroOrbitCanvas.jsx";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="landing-page">
      {/* Top Navigation */}
      <header className="landing-nav">
        <Link to="/" className="brand-mark" aria-label="Powerban Home">
          <span className="brand-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="7" cy="12" r="5" fill="currentColor" />
              <circle cx="17" cy="12" r="5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            </svg>
          </span>
          Powerban
        </Link>

        <nav aria-label="Main Navigation">
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#workflow">Workflow</a>
            </li>
            <li>
              <a href="#templates">Templates</a>
            </li>
            <li>
              <a href="#about">About</a>
            </li>
          </ul>
        </nav>

        <div className="nav-cta">
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
            <a href="#features" className="btn-pill-secondary">
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
            <h2 className="showcase-card-title">Workspaces & Groups</h2>
            <p className="showcase-card-text">
              Organize unlimited boards into logical workspaces and groups. Keep client
              deliverables, sprints, and personal milestones cleanly partitioned without
              cognitive clutter or unnecessary layers.
            </p>
          </div>

          <div className="showcase-card">
            <h2 className="showcase-card-title">Linked Boards & Progress</h2>
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
              Strict WIP limits on ongoing cards eliminate multitasking bottlenecks.
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
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
