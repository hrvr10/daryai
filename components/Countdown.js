"use client";

import { useEffect, useState } from "react";

function split(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export default function Countdown({ target }) {
  // null on the first render so server and client markup match — the real
  // numbers only appear after mount.
  const [left, setLeft] = useState(null);

  useEffect(() => {
    if (!target) return;
    const end = new Date(target).getTime();
    if (Number.isNaN(end)) return;

    const tick = () => setLeft(split(end - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!left) return null;

  const done =
    left.days === 0 &&
    left.hours === 0 &&
    left.minutes === 0 &&
    left.seconds === 0;
  if (done) return null;

  const units = [
    ["days", left.days],
    ["hrs", left.hours],
    ["min", left.minutes],
    ["sec", left.seconds],
  ];

  return (
    <div className="countdown" aria-label="Time until launch">
      {units.map(([label, value]) => (
        <div className="unit" key={label}>
          <span className="num">{String(value).padStart(2, "0")}</span>
          <span className="lab">{label}</span>
        </div>
      ))}
    </div>
  );
}
