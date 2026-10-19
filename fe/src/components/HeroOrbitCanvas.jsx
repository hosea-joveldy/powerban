import { useEffect, useRef } from "react";

/**
 * Celestial Orbit Particle Mesh
 * Evokes the concentric stippled ellipse geometries from references/landing-page-section1.png.
 * On desktop, tracks cursor movement and tilts with smooth damping (lerp factor 0.06).
 * Respects prefers-reduced-motion: reduce and hover: none fallbacks.
 */
export default function HeroOrbitCanvas({ className = "" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouchOnly = window.matchMedia("(hover: none)").matches;

    let animationFrameId = null;
    let width = 0;
    let height = 0;

    // Tilt physics state
    let targetTiltX = 0;
    let targetTiltY = 0;
    let currentTiltX = 0;
    let currentTiltY = 0;
    let mouseActive = false;

    // Resize canvas buffer to match display dimensions with DPR
    function handleResize() {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      drawFrame();
    }

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Mouse movement handler
    function handleMouseMove(e) {
      if (prefersReducedMotion || isTouchOnly) return;
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      targetTiltX = normY * 16; // Max 16 degrees tilt X
      targetTiltY = -normX * 18; // Max 18 degrees tilt Y
      mouseActive = true;
    }

    function handleMouseLeave() {
      targetTiltX = 0;
      targetTiltY = 0;
      mouseActive = false;
    }

    if (!isTouchOnly && !prefersReducedMotion) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      document.addEventListener("mouseleave", handleMouseLeave);
    }

    // Geometry definition for concentric stippled orbits matching reference
    const rings = [
      { rxRatio: 0.22, ryRatio: 0.14, tilt: -12, dots: 56, hasNode: true, nodeAngle: 0.7 },
      { rxRatio: 0.34, ryRatio: 0.22, tilt: 24, dots: 88, hasNode: true, nodeAngle: 2.3 },
      { rxRatio: 0.46, ryRatio: 0.30, tilt: -32, dots: 120, hasNode: false },
      { rxRatio: 0.58, ryRatio: 0.38, tilt: 15, dots: 160, hasNode: true, nodeAngle: 4.1 },
      { rxRatio: 0.72, ryRatio: 0.48, tilt: -8, dots: 210, hasNode: true, nodeAngle: 5.6 },
      { rxRatio: 0.88, ryRatio: 0.58, tilt: 42, dots: 260, hasNode: false },
    ];

    function drawFrame() {
      if (!ctx || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseScale = Math.min(width, height);

      // Check current theme colors
      const isDark = document.documentElement.getAttribute("data-theme") === "forest-dark";
      const dotColor = isDark ? "rgba(200, 220, 190, 0.42)" : "rgba(45, 60, 40, 0.45)";
      const ringStrokeColor = isDark ? "rgba(200, 220, 190, 0.15)" : "rgba(45, 60, 40, 0.16)";
      const nodeFill = isDark ? "#C8DB57" : "#1B2818";
      const nodeGlow = isDark ? "rgba(200, 219, 87, 0.3)" : "rgba(27, 40, 24, 0.15)";

      ctx.save();
      ctx.translate(cx, cy);

      rings.forEach((ring) => {
        const rx = ring.rxRatio * baseScale;
        const ry = ring.ryRatio * baseScale;
        const tiltRad = (ring.tilt * Math.PI) / 180;

        ctx.save();
        ctx.rotate(tiltRad);

        // Thin orbital ellipse trace
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = ringStrokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Stippled particle dots along ellipse perimeter
        const dotCount = ring.dots;
        ctx.fillStyle = dotColor;

        for (let i = 0; i < dotCount; i++) {
          const t = (i / dotCount) * Math.PI * 2;
          const px = rx * Math.cos(t);
          const py = ry * Math.sin(t);

          // Subtle variation in particle size to create astronomical stipple texture
          const size = ((i % 3) + 1) * 0.75;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Planetary node on selected orbits
        if (ring.hasNode && ring.nodeAngle !== undefined) {
          const nx = rx * Math.cos(ring.nodeAngle);
          const ny = ry * Math.sin(ring.nodeAngle);

          // Glow halo
          ctx.beginPath();
          ctx.arc(nx, ny, 8, 0, Math.PI * 2);
          ctx.fillStyle = nodeGlow;
          ctx.fill();

          // Core node
          ctx.beginPath();
          ctx.arc(nx, ny, 4, 0, Math.PI * 2);
          ctx.fillStyle = nodeFill;
          ctx.fill();
        }

        ctx.restore();
      });

      ctx.restore();
    }

    // Animation loop with smooth lerp tilt
    function animate() {
      if (prefersReducedMotion) {
        drawFrame();
        return;
      }

      // Smooth damping (lerp factor 0.06)
      currentTiltX += (targetTiltX - currentTiltX) * 0.06;
      currentTiltY += (targetTiltY - currentTiltY) * 0.06;

      if (container) {
        container.style.transform = `perspective(1000px) rotateX(${currentTiltX.toFixed(
          2
        )}deg) rotateY(${currentTiltY.toFixed(2)}deg)`;
      }

      drawFrame();
      animationFrameId = requestAnimationFrame(animate);
    }

    if (prefersReducedMotion || isTouchOnly) {
      handleResize();
    } else {
      handleResize();
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (!isTouchOnly && !prefersReducedMotion) {
        window.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`hero-orbit-container ${className}`.trim()}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transformStyle: "preserve-3d",
        transition: "transform 0.05s linear",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}
