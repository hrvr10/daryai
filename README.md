# daryai

A simple clothing store that works like an Instagram feed. Reels come in from
your Instagram account, you price them in an admin panel, and customers scroll
the grid, tap a piece, and pay with Razorpay.

```bash
npm install
npm run dev        # http://localhost:3000
```

The **storefront runs immediately** using placeholder seed products. The four
real features each switch on when you add their keys to `.env.local`
(copy `.env.example`).

---

## What's built

| Feature | Where | Needs |
| --- | --- | --- |
| Instagram-style infinite grid, 3 / 4 / 6 column toggle | [components/Feed.tsx](components/Feed.tsx) | nothing |
| Product page with reel video, size picker, add to cart | [app/product/[id]](app/product/%5Bid%5D/page.tsx) | nothing |
| Cart (saved in the browser) | [app/cart](app/cart/page.tsx) | nothing |
| **Admin panel** — set price + size variants per reel, show/hide | [app/admin](app/admin/page.tsx) | `ADMIN_PASSWORD` |
| **Connect Instagram** + **auto-fetch reels** | [app/admin/settings](app/admin/settings/page.tsx) | Instagram + Firebase |
| **Razorpay checkout** | [app/checkout](app/checkout/page.tsx) | Razorpay + Firebase |
| Orders stored | Firestore `orders` | Firebase |

Data lives in **Firestore** (`products`, `settings`, `orders`). Without Firebase
the site falls back to read-only seed data.

---

## Setup

### 1. Admin panel

In `.env.local`:

```
ADMIN_PASSWORD=your-password
ADMIN_SESSION_SECRET=any-long-random-string
```

Go to `/admin` and log in. (A throwaway password `letmein` is set for you now —
change it.)

### 2. Firebase (Firestore)

1. Create a Firebase project → **Firestore Database** → create (production mode).
2. Project settings → **Service accounts** → **Generate new private key**.
3. From the downloaded JSON, copy into `.env.local`:

```
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@xxx.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Keep the `\n` sequences in the private key exactly as they appear in the JSON.

### 3. Instagram (auto-fetch reels)

Uses **Instagram API with Instagram Login** (your account must be a
**Business** or **Creator** account).

1. [developers.facebook.com](https://developers.facebook.com) → create an app →
   add the **Instagram** product → **API setup with Instagram login**.
2. Add an **OAuth redirect URI**: `https://YOUR-DOMAIN/api/instagram/callback`
   (Instagram requires HTTPS — for local dev run a tunnel like
   `cloudflared tunnel --url http://localhost:3000` or `ngrok http 3000` and use
   that HTTPS URL).
3. Add yourself as an Instagram tester and accept the invite in the Instagram
   app (Settings → Apps and websites → Tester invites).
4. In `.env.local`:

```
INSTAGRAM_APP_ID=xxx
INSTAGRAM_APP_SECRET=xxx
INSTAGRAM_REDIRECT_URI=https://YOUR-DOMAIN/api/instagram/callback
NEXT_PUBLIC_SITE_URL=https://YOUR-DOMAIN
```

5. Restart, open `/admin/settings`, click **Connect Instagram**, then
   **Sync reels now**. Reels arrive **hidden**; open `/admin`, set a price and
   sizes, tick **Live**.

> Instagram media URLs expire after ~2 days. Re-sync regularly — either click
> Sync, or hit `POST /api/instagram/sync` from a cron (e.g. GitHub Actions,
> Vercel Cron, cron-job.org). That endpoint needs the admin session cookie, so
> for an unattended cron add a shared-secret check (see
> `app/api/instagram/sync/route.ts`).

For anyone other than app testers to connect, the Meta app needs **App Review**
for `instagram_business_basic`.

### 4. Razorpay

```
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
```

Checkout creates a Razorpay order server-side, opens Razorpay Checkout, and
verifies the payment signature before marking the order paid
([app/api/checkout](app/api/checkout)). Optional: set a webhook to
`/api/razorpay/webhook` (events `payment.captured`, `payment.failed`) with
`RAZORPAY_WEBHOOK_SECRET`.

---

## Notes

- `npm run build` passes. `jose` prints an Edge-runtime warning about
  `CompressionStream` — harmless, that code path isn't used.
- SQLite/local files aren't used; all persistence is Firestore, so this deploys
  cleanly to serverless (Vercel etc.). Set the same env vars there.
- Admin routes and admin APIs are guarded by [middleware.ts](middleware.ts).
