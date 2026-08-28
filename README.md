# Daryai — coming soon

A one-page holding site. Sage field with an animated cloth that lifts under the
cursor (and drifts on its own on touch devices), the wordmark set in Gotu, a
countdown, and an email + WhatsApp capture that writes into Brevo.

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

**From the folder:**

```bash
npm i -g vercel
vercel               # first deploy, answer the prompts
vercel --prod
```

**From GitHub:** push this folder to a repo, then Vercel → Add New → Project →
import it. The Next.js preset is detected automatically; there are no build
settings to change.

Then point `daryai.in` at it under Project → Settings → Domains.

## Environment variables

Set these in Vercel → Settings → Environment Variables. All are optional — with
none of them the site runs fine and signups go to the function logs instead of
Brevo.

| Variable | What it does |
|---|---|
| `BREVO_API_KEY` | Brevo API key. Without it the form still succeeds, it just doesn't store. |
| `BREVO_LIST_ID` | Numeric Brevo list id to add contacts to. |
| `NEXT_PUBLIC_LAUNCH_DATE` | ISO date, e.g. `2026-10-15T10:00:00+05:30`. Leave blank to hide the countdown. |
| `NEXT_PUBLIC_INSTAGRAM` | Handle without the `@`. Defaults to `daryai`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL, used for the social preview tags. |

`NEXT_PUBLIC_*` values are baked in at build time — redeploy after changing them.

## What you'll want to change

- **Launch date** — `NEXT_PUBLIC_LAUNCH_DATE`. If you don't have one yet, leave it
  empty; the countdown disappears cleanly rather than showing zeros.
- **Copy** — all of it is in `app/page.js`.
- **The cloth** — `components/ClothCanvas.js`. `lines` sets density, `lift` how far
  it rises under the cursor, and the two `Math.sin` terms control the drift.
- **Social preview** — `public/og.png` (1200×630). Swap in a real photograph once
  you have one; it's what shows in WhatsApp forwards.
- **Icon** — `app/icon.png`.

## Notes

- Gotu is self-hosted from `public/fonts` via `next/font/local`, so it renders the
  same everywhere with no Google Fonts request and no layout shift.
- The hidden `company` field is a honeypot. Bots fill it in, humans never see it,
  and those submissions are silently dropped.
- The canvas respects `prefers-reduced-motion`, caps device pixel ratio at 2, and
  never intercepts taps.
- Duplicate Brevo signups are treated as success, so a returning visitor doesn't
  get an error.
- Tested with `next build` and a live POST to `/api/subscribe` — valid emails
  return `200`, malformed ones `400`, honeypot hits return `200` and are discarded.
