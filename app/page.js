"use client";

import { useState } from "react";
import ClothCanvas from "../components/ClothCanvas";
import Countdown from "../components/Countdown";

const LAUNCH = process.env.NEXT_PUBLIC_LAUNCH_DATE || "";
const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM || "daryai";
const WHATSAPP = "919990957711";

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

      <a
        className="wa"
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16.02 3.2c-7.06 0-12.8 5.73-12.8 12.8 0 2.26.6 4.46 1.73 6.4L3.2 28.8l6.56-1.72a12.76 12.76 0 0 0 6.25 1.6h.01c7.06 0 12.8-5.73 12.8-12.8 0-3.42-1.33-6.63-3.75-9.05a12.7 12.7 0 0 0-9.05-3.63Zm0 23.3h-.01a10.6 10.6 0 0 1-5.4-1.48l-.39-.23-4.04 1.06 1.08-3.94-.25-.4a10.6 10.6 0 0 1-1.62-5.63c0-5.86 4.77-10.63 10.64-10.63 2.84 0 5.5 1.11 7.51 3.12a10.56 10.56 0 0 1 3.12 7.52c0 5.86-4.77 10.62-10.63 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.29-.11-.5-.16-.71.16-.21.32-.82 1.04-1 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59-.95-.85-1.59-1.9-1.78-2.22-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.71-1.72-.98-2.35-.26-.62-.52-.54-.71-.55-.18-.01-.4-.01-.61-.01-.21 0-.56.08-.85.4-.29.32-1.11 1.09-1.11 2.65 0 1.56 1.14 3.07 1.3 3.28.16.21 2.24 3.42 5.43 4.8.76.33 1.35.52 1.81.67.76.24 1.45.21 2 .13.61-.09 1.89-.77 2.16-1.52.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"
          />
        </svg>
      </a>
    </>
  );
}
