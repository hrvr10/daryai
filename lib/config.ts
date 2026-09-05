// Central place to read env and know which features are wired up.

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

export const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

export const instagramConfig = {
  appId: process.env.INSTAGRAM_APP_ID || "",
  appSecret: process.env.INSTAGRAM_APP_SECRET || "",
  redirectUri:
    process.env.INSTAGRAM_REDIRECT_URI ||
    `${siteUrl}/api/instagram/callback`,
  // Scopes for "Instagram API with Instagram Login" (reels + captions).
  scope: "instagram_business_basic",
};

export const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || "",
  keySecret: process.env.RAZORPAY_KEY_SECRET || "",
  publicKeyId:
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    process.env.RAZORPAY_KEY_ID ||
    "",
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "",
};

export const adminConfig = {
  password: process.env.ADMIN_PASSWORD || "",
  sessionSecret:
    process.env.ADMIN_SESSION_SECRET || "insecure-dev-secret-change-me",
};

export const delhiveryConfig = {
  apiToken: process.env.DELHIVERY_API_TOKEN || "",
  // "production" hits track.delhivery.com (real pickups/AWBs); anything
  // else (default) hits staging-express.delhivery.com for testing.
  environment: process.env.DELHIVERY_ENV === "production" ? "production" : "staging",
  // Exact, case-sensitive name of the registered pickup location/warehouse.
  pickupLocation: process.env.DELHIVERY_PICKUP_LOCATION || "",
};

export const bunnyConfig = {
  libraryId: process.env.BUNNY_STREAM_LIBRARY_ID || "",
  apiKey: process.env.BUNNY_STREAM_API_KEY || "",
  // The library's CDN hostname, e.g. "vz-xxxxxxxx.b-cdn.net" — protocol and
  // trailing slash tolerated.
  hostname: (process.env.BUNNY_STREAM_HOSTNAME || "")
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, ""),
  // Which MP4-fallback resolution to serve. Must be enabled in the library's
  // encoding settings (720p is on by default).
  mp4Resolution: process.env.BUNNY_STREAM_MP4_RESOLUTION || "720p",
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.projectId &&
    firebaseConfig.clientEmail &&
    firebaseConfig.privateKey,
);

export const isInstagramConfigured = Boolean(
  instagramConfig.appId && instagramConfig.appSecret,
);

export const isRazorpayConfigured = Boolean(
  razorpayConfig.keyId && razorpayConfig.keySecret,
);

export const isAdminConfigured = Boolean(adminConfig.password);

export const isDelhiveryConfigured = Boolean(
  delhiveryConfig.apiToken && delhiveryConfig.pickupLocation,
);

export const isBunnyConfigured = Boolean(
  bunnyConfig.libraryId && bunnyConfig.apiKey && bunnyConfig.hostname,
);
