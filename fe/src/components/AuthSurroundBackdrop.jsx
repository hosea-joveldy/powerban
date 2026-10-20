import React from "react";

export default function AuthSurroundBackdrop() {
  return (
    <div className="auth-surround-container" aria-hidden="true">
      {/* Background IDE & Terminal Watermark */}
      <div className="auth-backdrop-watermark">
        <div className="auth-backdrop-sidebar">
          <div className="sidebar-line brand">+ New Conversation</div>
          <div className="sidebar-line">🕒 Conversation History</div>
          <div className="sidebar-line">⚙️ Automations</div>
          <div className="sidebar-line">📦 Customizations</div>
          <div className="sidebar-section-title">Projects</div>
          <div className="sidebar-line indent">📁 science/biomolec...</div>
          <div className="sidebar-line indent">📁 powerban</div>
          <div className="sidebar-line indent-2">📄 schema.sql</div>
          <div className="sidebar-line indent-2">📄 routes.php</div>
          <div className="sidebar-line indent-2">📄 Board.jsx</div>
        </div>

        <div className="auth-backdrop-console">
          <div className="console-line highlight">VITE v5.4.21 ready in 133 ms</div>
          <div className="console-line">➜ Local: http://localhost:5173/qibar/powerban/</div>
          <div className="console-line">➜ Network: use --host to expose</div>
          <div className="console-line muted">press h + enter to show help</div>
          <div className="console-line code">SELECT b.id, b.name, count(t.id) as total FROM boards b</div>
          <div className="console-line code">JOIN cards c ON c.board_id = b.id</div>
          <div className="console-line code">LEFT JOIN tasks t ON t.card_id = c.id GROUP BY b.id;</div>
        </div>
      </div>

      {/* 3D Floating Sculptural Pebbles (matching references/login.png) */}
      {/* 1. Top-Right Floating Pebble (Warm Terracotta / Amber organic shape) */}
      <div className="floating-rock rock-top-right">
        <svg width="220" height="220" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock-tr-grad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffb076" />
              <stop offset="35%" stopColor="#e06530" />
              <stop offset="70%" stopColor="#963c12" />
              <stop offset="100%" stopColor="#4e1b04" />
            </radialGradient>
            <radialGradient id="rock-tr-spec" cx="40%" cy="25%" r="30%">
              <stop offset="0%" stopColor="rgba(255, 240, 225, 0.7)" />
              <stop offset="100%" stopColor="rgba(255, 240, 225, 0)" />
            </radialGradient>
            <filter id="shadow-tr" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="12" dy="24" stdDeviation="16" floodColor="#1a0a02" floodOpacity="0.35" />
            </filter>
          </defs>
          <path
            d="M 60,35 C 120,15 175,60 165,115 C 155,165 95,185 45,155 C 5,125 10,60 60,35 Z"
            fill="url(#rock-tr-grad)"
            filter="url(#shadow-tr)"
          />
          <path
            d="M 60,35 C 120,15 175,60 165,115 C 155,165 95,185 45,155 C 5,125 10,60 60,35 Z"
            fill="url(#rock-tr-spec)"
          />
        </svg>
      </div>

      {/* 2. Mid-Right Floating Pebble (Deep Metallic Green / Amber organic stone) */}
      <div className="floating-rock rock-mid-right">
        <svg width="180" height="260" viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock-mr-grad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#c87b48" />
              <stop offset="45%" stopColor="#7a421c" />
              <stop offset="80%" stopColor="#314427" />
              <stop offset="100%" stopColor="#15210e" />
            </radialGradient>
            <radialGradient id="rock-mr-spec" cx="45%" cy="30%" r="25%">
              <stop offset="0%" stopColor="rgba(235, 245, 215, 0.6)" />
              <stop offset="100%" stopColor="rgba(235, 245, 215, 0)" />
            </radialGradient>
            <filter id="shadow-mr" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="14" dy="20" stdDeviation="18" floodColor="#0d140a" floodOpacity="0.4" />
            </filter>
          </defs>
          <path
            d="M 50,25 C 110,15 145,55 140,120 C 135,180 85,225 35,205 C -5,185 5,120 15,70 C 22,35 30,28 50,25 Z"
            fill="url(#rock-mr-grad)"
            filter="url(#shadow-mr)"
          />
          <path
            d="M 50,25 C 110,15 145,55 140,120 C 135,180 85,225 35,205 C -5,185 5,120 15,70 C 22,35 30,28 50,25 Z"
            fill="url(#rock-mr-spec)"
          />
        </svg>
      </div>

      {/* 3. Bottom-Left Floating Pebble Cluster (Iridescent violet, emerald, and warm gold) */}
      <div className="floating-rock rock-bottom-left">
        <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="rock-bl-1" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#e49058" />
              <stop offset="50%" stopColor="#b44d18" />
              <stop offset="100%" stopColor="#551a02" />
            </radialGradient>
            <radialGradient id="rock-bl-2" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#a3d69c" />
              <stop offset="45%" stopColor="#578e72" />
              <stop offset="85%" stopColor="#764789" />
              <stop offset="100%" stopColor="#2c163b" />
            </radialGradient>
            <radialGradient id="rock-bl-spec" cx="45%" cy="35%" r="30%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <filter id="shadow-bl" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="-10" dy="18" stdDeviation="16" floodColor="#180e22" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* Background smaller pebble */}
          <path
            d="M 55,40 C 95,20 135,50 125,100 C 115,145 65,160 30,135 C 0,110 20,60 55,40 Z"
            fill="url(#rock-bl-1)"
            filter="url(#shadow-bl)"
          />

          {/* Foreground iridescent pebble */}
          <path
            d="M 115,70 C 175,55 215,95 205,155 C 195,205 135,225 85,200 C 45,180 55,130 85,90 C 95,75 105,72 115,70 Z"
            fill="url(#rock-bl-2)"
            filter="url(#shadow-bl)"
          />
          <path
            d="M 115,70 C 175,55 215,95 205,155 C 195,205 135,225 85,200 C 45,180 55,130 85,90 C 95,75 105,72 115,70 Z"
            fill="url(#rock-bl-spec)"
          />
        </svg>
      </div>
    </div>
  );
}
