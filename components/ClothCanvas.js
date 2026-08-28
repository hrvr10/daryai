"use client";

import { useEffect, useRef } from "react";

/**
 * Draws a field of horizontal folds that drift on their own and lift where
 * the pointer is — the brand line ("cloth that moves like water") as motion.
 * Canvas 2D on purpose: no WebGL, works on every phone.
 */
export default function ClothCanvas({ disturbance = 0 }) {
  const ref = useRef(null);
  const pointer = useRef({ x: -9999, y: -9999, active: false });
  const kick = useRef(0);

  // A tap on the wordmark bumps this; the ripple decays on its own.
  useEffect(() => {
    if (disturbance > 0) kick.current = 1;
  }, [disturbance]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let lines = 0;
    let raf = 0;
    let t = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lines = w < 640 ? 26 : 44;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      const step = w < 640 ? 12 : 8;
      const gap = h / (lines - 1);
      const p = pointer.current;
      const radius = Math.min(w, h) * 0.3;
      const lift = 46 + kick.current * 90;

      for (let i = 0; i < lines; i++) {
        const baseY = i * gap;
        // depth: folds fade toward the top of the frame
        const depth = 0.35 + 0.65 * (i / lines);
        const highlight = i % 7 === 3;

        ctx.beginPath();
        for (let x = -step; x <= w + step; x += step) {
          const drift =
            Math.sin(x * 0.0042 + t * 0.45 + i * 0.38) * (7 + depth * 9) +
            Math.sin(x * 0.0016 - t * 0.28 + i * 0.17) * (11 + depth * 7);

          let push = 0;
          if (p.active) {
            const dx = x - p.x;
            const dy = baseY - p.y;
            const d2 = dx * dx + dy * dy;
            push = -lift * Math.exp(-d2 / (2 * radius * radius));
          }

          const y = baseY + drift + push;
          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = highlight
          ? `rgba(244, 243, 236, ${0.1 + depth * 0.16})`
          : `rgba(31, 31, 31, ${0.045 + depth * 0.075})`;
        ctx.lineWidth = highlight ? 1.6 : 1.1;
        ctx.stroke();
      }
    }

    function frame() {
      t += reduced ? 0 : 0.016;
      kick.current *= 0.94;
      draw();
      raf = requestAnimationFrame(frame);
    }

    function move(e) {
      const touch = e.touches && e.touches[0];
      pointer.current = {
        x: touch ? touch.clientX : e.clientX,
        y: touch ? touch.clientY : e.clientY,
        active: true,
      };
    }

    function leave() {
      pointer.current.active = false;
    }

    resize();
    // On touch devices there is no hovering pointer, so keep a soft centre
    // of gravity moving instead of a dead canvas.
    if (window.matchMedia("(hover: none)").matches) {
      pointer.current = { x: w * 0.5, y: h * 0.45, active: true };
    }

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} className="cloth" aria-hidden="true" />;
}
