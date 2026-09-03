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
