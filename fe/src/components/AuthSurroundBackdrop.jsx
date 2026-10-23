import React from "react";
import { History, Settings, Package, Folder, FileText, ArrowRight } from "lucide-react";

export default function AuthSurroundBackdrop() {
  return (
    <div className="auth-surround-container" aria-hidden="true">
      {/* Background IDE & Terminal Watermark */}
      <div className="auth-backdrop-watermark">
        <div className="auth-backdrop-sidebar">
          <div className="sidebar-line brand">+ New Conversation</div>
          <div className="sidebar-line">
            <History size={12} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            Conversation History
          </div>
          <div className="sidebar-line">
            <Settings size={12} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            Automations
          </div>
          <div className="sidebar-line">
            <Package size={12} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            Customizations
          </div>
          <div className="sidebar-section-title">Projects</div>
          <div className="sidebar-line indent">
            <Folder size={11} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            science/biomolec...
          </div>
          <div className="sidebar-line indent">
            <Folder size={11} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            powerban
          </div>
          <div className="sidebar-line indent-2">
            <FileText size={11} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            schema.sql
          </div>
          <div className="sidebar-line indent-2">
            <FileText size={11} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            routes.php
          </div>
          <div className="sidebar-line indent-2">
            <FileText size={11} style={{ marginRight: 6, verticalAlign: "-1px" }} />
            Board.jsx
          </div>
        </div>

        <div className="auth-backdrop-console">
          <div className="console-line highlight">VITE v5.4.21 ready in 133 ms</div>
          <div className="console-line">
            <ArrowRight size={11} style={{ marginRight: 4, verticalAlign: "-1px" }} />
            Local: http://localhost:5173/qibar/powerban/
          </div>
          <div className="console-line">
            <ArrowRight size={11} style={{ marginRight: 4, verticalAlign: "-1px" }} />
            Network: use --host to expose
          </div>
          <div className="console-line muted">press h + enter to show help</div>
          <div className="console-line code">SELECT b.id, b.name, count(t.id) as total FROM boards b</div>
          <div className="console-line code">JOIN cards c ON c.board_id = b.id</div>
          <div className="console-line code">LEFT JOIN tasks t ON t.card_id = c.id GROUP BY b.id;</div>
        </div>
      </div>

      {/* 3D Floating Sculptural Pebbles (matching references/login.png) */}
      {/* 1. Top-Right Floating Pebble (Warm Terracotta / Amber organic shape) */}
      <div className="floating-rock rock-top-right">
        <svg
          width="240"
          height="240"
          viewBox="-20 -20 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="rock-tr-grad" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#ffe6d5" />
              <stop offset="35%" stopColor="#ffb288" />
              <stop offset="70%" stopColor="#f58652" />
              <stop offset="100%" stopColor="#e2662c" />
            </radialGradient>
            <radialGradient id="rock-tr-spec" cx="40%" cy="25%" r="30%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <filter id="shadow-tr" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="8" dy="16" stdDeviation="16" floodColor="#8c3a10" floodOpacity="0.22" />
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

      {/* 2. Mid-Right Floating Pebble (Bright Spring Sage & Amber organic stone) */}
      <div className="floating-rock rock-mid-right">
        <svg
          width="200"
          height="280"
          viewBox="-20 -20 200 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="rock-mr-grad" cx="40%" cy="35%" r="60%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="35%" stopColor="#fcd34d" />
              <stop offset="70%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#34d399" />
            </radialGradient>
            <radialGradient id="rock-mr-spec" cx="45%" cy="30%" r="25%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.75)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <filter id="shadow-mr" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="10" dy="16" stdDeviation="16" floodColor="#065f46" floodOpacity="0.2" />
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

      {/* 3. Bottom-Left Floating Pebble Cluster (Luminous pastel violet & warm gold) */}
      <div className="floating-rock rock-bottom-left">
        <svg
          width="260"
          height="260"
          viewBox="-20 -20 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: "visible" }}
        >
          <defs>
            <radialGradient id="rock-bl-1" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#ffedd5" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>
            <radialGradient id="rock-bl-2" cx="40%" cy="30%" r="65%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="40%" stopColor="#d8b4fe" />
              <stop offset="75%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#7c3aed" />
            </radialGradient>
            <radialGradient id="rock-bl-spec" cx="45%" cy="35%" r="30%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
            <filter id="shadow-bl" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="-6" dy="14" stdDeviation="16" floodColor="#5b21b6" floodOpacity="0.22" />
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
