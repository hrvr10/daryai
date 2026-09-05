"use client";

import { useEffect, useRef, useState } from "react";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]';

// Damped-spring constants (force-based, not simple lerp) — tuned to feel
// like the reference "smooth cursor" effect: a quick, slightly elastic
// chase rather than a linear trail.
const STIFFNESS = 900;
const DAMPING = 40;
const ROTATION_SPEED_THRESHOLD = 0.15; // px/ms below which we stop rotating

/**
 * Replaces the native cursor with a single arrow glyph that springs
 * toward the pointer and leans into the direction of travel — the
 * position AND the rotation are both physically simulated (not CSS
 * transitions), so fast flicks overshoot and settle the way a real
 * spring would. Desktop only.
 */
export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setEnabled(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("custom-cursor-active");

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let x = targetX;
    let y = targetY;
    let vx = 0;
    let vy = 0;
    let angle = 0;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      const target = e.target as HTMLElement | null;
      setHovering(!!target?.closest(INTERACTIVE_SELECTOR));
    };
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.032);
      last = now;

      const ax = STIFFNESS * (targetX - x) - DAMPING * vx;
      const ay = STIFFNESS * (targetY - y) - DAMPING * vy;
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;

      const speed = Math.hypot(vx, vy);
      if (speed > ROTATION_SPEED_THRESHOLD * 1000) {
        angle = (Math.atan2(vy, vx) * 180) / Math.PI + 90;
      }

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        className={`-translate-y-px transition-transform duration-150 ease-out ${
          pressed ? "scale-90" : hovering ? "scale-125" : "scale-100"
        }`}
      >
        <path
          d="M12 2.5 L19.5 20.5 L12 16.8 L4.5 20.5 Z"
          className={`transition-colors duration-150 ${
            hovering ? "fill-brand-700" : "fill-black"
          }`}
          stroke="white"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
