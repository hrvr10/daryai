import "server-only";
import {
  getApps,
  initializeApp,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./config";

let app: App | undefined;
let firestore: Firestore | undefined;

/**
 * Returns a Firestore instance, or null when Firebase env vars are not set.
 * Callers should fall back to seed data when this is null.
 */
export function getDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!firestore) {
    app =
      getApps()[0] ||
      initializeApp({
        credential: cert({
          projectId: firebaseConfig.projectId,
          clientEmail: firebaseConfig.clientEmail,
          privateKey: firebaseConfig.privateKey,
        }),
      });
    firestore = getFirestore(app);
    try {
      // Several optional fields across the app (codFee, delhivery.*, etc.)
      // are conditionally set to `undefined` rather than omitted — without
      // this, Firestore throws on any write containing one instead of just
      // skipping it. Wrapped in try/catch because the underlying Firestore
      // client is a singleton keyed on `app` that can outlive this module's
      // own `firestore` variable across dev-mode hot reloads — if settings()
      // was already applied on it, calling it again throws, which is safe
      // to ignore (it means the setting we want is already in effect).
      firestore.settings({ ignoreUndefinedProperties: true });
    } catch {
      /* already configured on this Firestore instance — fine */
    }
  }
  return firestore;
}

/** Like getDb() but throws — use in admin/write paths that require Firebase. */
export function requireDb(): Firestore {
  const db = getDb();
  if (!db) {
    throw new Error(
      "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local",
    );
  }
  return db;
}
