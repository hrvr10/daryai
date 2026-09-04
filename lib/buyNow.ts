"use client";

import type { CartLine } from "./CartContext";

// "Buy Now" checks out a single item immediately without touching the
// shared cart (so it never mixes with whatever else is already in there).
// Held in sessionStorage — not localStorage — so it doesn't linger across
// tabs/sessions the way the cart intentionally does.
const KEY = "daryai_buynow_v1";

export function setBuyNow(line: CartLine) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(line));
  } catch {
    /* ignore */
  }
}

export function getBuyNow(): CartLine | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartLine) : null;
  } catch {
    return null;
  }
}

export function clearBuyNow() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
