"use client";

import { useState } from "react";
import ClothCanvas from "../components/ClothCanvas";
import Countdown from "../components/Countdown";
import SignupForm from "../components/SignupForm";

const LAUNCH = process.env.NEXT_PUBLIC_LAUNCH_DATE || "";
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || "daryai";

export default function Page() {
  const [ripple, setRipple] = useState(0);

  return (
    <>
      <ClothCanvas disturbance={ripple} />

      <main className="shell">
        <div className="top">
          <span>Daryai</span>
          <span>Delhi</span>
        </div>

        <div className="center">
          <h1
            className="wordmark"
            onPointerDown={() => setRipple((n) => n + 1)}
            title="Go on, touch it"
          >
            DARYAI
          </h1>

          <p className="tagline">Cloth that moves like water.</p>

          <p className="blurb">
            Kaftans, co-ord sets and suit sets, cut and sewn in Delhi.
            Fabric you can judge by hand, fits that skip the tailor, and
            photographs that tell the truth. <strong>Opening soon.</strong>
          </p>

          <Countdown target={LAUNCH} />

          <SignupForm instagram={INSTAGRAM} />
        </div>

        <footer className="bottom">
          <span>Kaftans · Co-ord sets · Suit sets</span>
          <a
            href={`https://instagram.com/${INSTAGRAM}`}
            target="_blank"
            rel="noreferrer"
          >
            @{INSTAGRAM}
          </a>
        </footer>
      </main>
    </>
  );
}
