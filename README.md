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
| **Admin panel** — set price + size variants per reel, show/hide | [app/adminin](app/adminin/page.tsx) | `ADMIN_PASSWORD` |
| **Connect Instagram** + **auto-fetch reels** (+ daily cron) | [app/adminin/settings](app/adminin/settings/page.tsx) | Instagram + Firebase |
| **Razorpay checkout** — Express (pay online) or Cash on Delivery (₹250 online + rest in cash) | [app/checkout](app/checkout/page.tsx) | Razorpay + Firebase |
| **Orders list** + **Delhivery shipment/tracking** | [app/adminin/orders](app/adminin/orders/page.tsx) | Firebase (Delhivery optional) |

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

Go to `/adminin` and log in. (A throwaway password `letmein` is set for you now —
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

5. Restart, open `/adminin/settings`, click **Connect Instagram**, then
   **Sync reels now**. Reels arrive **hidden**; open `/adminin`, set a price and
   sizes, tick **Live**.

> Instagram media URLs expire after ~2 days, so this also syncs on its own
> **once a day** via Vercel Cron (see [vercel.json](vercel.json) and
> `app/api/cron/sync-instagram/route.ts`) — set `CRON_SECRET` (any random
> string) in the project's Vercel env vars and it starts working on the next
> deploy, no extra setup. You can still click **Sync reels now** any time for
> an immediate pull. Vercel's free (Hobby) plan allows cron jobs to run once a
> day, which is exactly what this uses.

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

At checkout, customers choose **Express** (pay the full amount online) or
**Cash on delivery** (pay a ₹250 confirmation fee online now via Razorpay;
the rest is collected in cash on delivery). Either way, Razorpay is always
charged *something* — COD never skips payment entirely, which cuts down on
fake/no-show COD orders. The ₹250 amount lives in `COD_FEE_INR` in
[lib/products.ts](lib/products.ts).

### 5. Delhivery (shipping)

Optional. Reference:
[one.delhivery.com/developer-portal/documents/b2c](https://one.delhivery.com/developer-portal/documents/b2c/).

1. Get an API token from your Delhivery account (`one.delhivery.com`).
2. Register a pickup location ("client warehouse") — either from Delhivery's
   own dashboard, or by calling their **Client Warehouse Creation** API once
   yourself with your business address (`lib/business.ts` has it). The name
   you register is case-sensitive and must match exactly what you set below.
3. In `.env.local` (or Vercel env vars):

```
DELHIVERY_API_TOKEN=xxx
DELHIVERY_ENV=staging          # "production" once Delhivery has approved you
DELHIVERY_PICKUP_LOCATION=your-registered-warehouse-name
```

4. Restart. Go to `/adminin/orders` — each paid/COD-confirmed order gets a
   **Create Delhivery shipment** button, which manifests it and stores the
   waybill number, plus a **Refresh tracking** button once one exists.
   Checkout also gets a soft, non-blocking heads-up if a PIN code isn't
   serviceable (`app/api/checkout/pincode-check`).

The client (`lib/delhivery.ts`) covers pincode serviceability, warehouse
registration, shipment creation, tracking, and shipping labels — the core B2C
lifecycle. Shipment creation has been confirmed working against a real
account (waybill issued, status "Manifested"). One thing to know: Delhivery
deducts a manifest charge from your account's **prepaid wallet balance** at
creation time — an empty wallet fails with "insufficient balance" (a clear
error message surfaced on the order, not a code bug) — so keep it topped up
at [one.delhivery.com](https://one.delhivery.com). If a shipment ever fails
for another reason, the exact reason from Delhivery is shown inline in
`/adminin/orders` and stored on the order's `delhivery.error` field. Pickup
requests, shipping labels, cancellations, and NDR/RVP flows aren't wired up
yet; Delhivery's own dashboard ("One Panel") can be used for those meanwhile.

---

## Notes

- `npm run build` passes. `jose` prints an Edge-runtime warning about
  `CompressionStream` — harmless, that code path isn't used.
- SQLite/local files aren't used; all persistence is Firestore, so this deploys
  cleanly to serverless (Vercel etc.). Set the same env vars there.
- Admin routes and admin APIs are guarded by [middleware.ts](middleware.ts).
