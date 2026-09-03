import "server-only";
import { getDb, requireDb } from "./firebase";
import { seedProducts, type Product, type SizeVariant } from "./products";

const PRODUCTS = "products";
const SETTINGS = "settings";
const ORDERS = "orders";

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type ProductPage = {
  items: Product[];
  nextCursor: string | null;
};

function normalizeProduct(id: string, data: any): Product {
  return {
    id,
    source: data.source ?? "manual",
    name: data.name ?? "Untitled",
    price: Number(data.price ?? 0),
    currency: data.currency ?? "INR",
    image: data.image ?? "",
    videoUrl: data.videoUrl ?? undefined,
    permalink: data.permalink ?? undefined,
    description: data.description ?? "",
    sizes: Array.isArray(data.sizes) ? (data.sizes as SizeVariant[]) : [],
    active: data.active !== false,
    order: Number(data.order ?? 0),
    createdAt: Number(data.createdAt ?? 0),
    igMediaId: data.igMediaId ?? undefined,
    syncedAt: data.syncedAt ? Number(data.syncedAt) : undefined,
  };
}

export async function listProducts(opts: {
  limit?: number;
  cursor?: string | null;
  includeInactive?: boolean;
}): Promise<ProductPage> {
  const limit = Math.min(Math.max(opts.limit ?? 12, 1), 48);
  const cursorOrder = opts.cursor != null ? Number(opts.cursor) : null;
  const db = getDb();

  if (!db) {
    // Seed fallback.
    let items = [...seedProducts].sort((a, b) => a.order - b.order);
    if (!opts.includeInactive) items = items.filter((p) => p.active);
    if (cursorOrder != null) items = items.filter((p) => p.order > cursorOrder);
    const page = items.slice(0, limit);
    const nextCursor =
      page.length === limit ? String(page[page.length - 1].order) : null;
    return { items: page, nextCursor };
  }

  // Order by a single field so no composite index is needed; filter
  // `active` in memory and over-fetch to compensate.
  const fetchCount = opts.includeInactive ? limit : limit * 3 + 3;
  let q = db.collection(PRODUCTS).orderBy("order", "asc");
  if (cursorOrder != null) q = q.startAfter(cursorOrder);
  q = q.limit(fetchCount);

  const snap = await q.get();
  const fetched = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
  const exhausted = fetched.length < fetchCount;
  const lastFetchedOrder =
    fetched.length > 0 ? fetched[fetched.length - 1].order : cursorOrder ?? 0;

  const visible = opts.includeInactive
    ? fetched
    : fetched.filter((p) => p.active);
  const items = visible.slice(0, limit);
  const nextCursor = exhausted ? null : String(lastFetchedOrder);
  return { items, nextCursor };
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getDb();
  if (!db) return seedProducts.find((p) => p.id === id) ?? null;
  const doc = await db.collection(PRODUCTS).doc(id).get();
  return doc.exists ? normalizeProduct(doc.id, doc.data()!) : null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const db = getDb();
  if (!db)
    return seedProducts.filter((p) => ids.includes(p.id));
  const reads = await Promise.all(
    ids.map((id) => db.collection(PRODUCTS).doc(id).get()),
  );
  return reads
    .filter((d) => d.exists)
    .map((d) => normalizeProduct(d.id, d.data()!));
}

export type ProductPatch = Partial<
  Pick<Product, "price" | "sizes" | "active" | "name" | "description" | "order">
>;

export async function updateProduct(
  id: string,
  patch: ProductPatch,
): Promise<void> {
  const db = requireDb();
  await db.collection(PRODUCTS).doc(id).set(patch, { merge: true });
}

/** Upsert a product from an Instagram reel, preserving admin-set commerce fields. */
export async function upsertProductFromReel(reel: {
  igMediaId: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl?: string;
  permalink?: string;
  timestampMs: number;
}): Promise<"created" | "updated"> {
  const db = requireDb();
  const ref = db.collection(PRODUCTS).doc(reel.igMediaId);
  const existing = await ref.get();

  const media = {
    source: "instagram" as const,
    igMediaId: reel.igMediaId,
    image: reel.thumbnailUrl,
    videoUrl: reel.videoUrl ?? null,
    permalink: reel.permalink ?? null,
    caption: reel.caption,
    order: -reel.timestampMs, // newest reel first
    syncedAt: Date.now(),
  };

  if (!existing.exists) {
    await ref.set({
      ...media,
      name: firstLine(reel.caption) || "Instagram reel",
      description: reel.caption,
      price: 0,
      currency: "INR",
      sizes: [] as SizeVariant[],
      active: false, // hidden until a price is set
      createdAt: Date.now(),
    });
    return "created";
  }

  // Keep price / sizes / active / name / description as the admin left them.
  await ref.set(media, { merge: true });
  return "updated";
}

function firstLine(text: string): string {
  return (text || "").split("\n")[0].slice(0, 80).trim();
}

// ---------------------------------------------------------------------------
// Instagram settings  (settings/instagram)
// ---------------------------------------------------------------------------

export type InstagramSettings = {
  connected: boolean;
  igUserId?: string;
  username?: string;
  accessToken?: string;
  tokenExpiresAt?: number;
  connectedAt?: number;
  lastSyncAt?: number;
  lastSyncCount?: number;
};

export async function getInstagramSettings(): Promise<InstagramSettings> {
  const db = getDb();
  if (!db) return { connected: false };
  const doc = await db.collection(SETTINGS).doc("instagram").get();
  if (!doc.exists) return { connected: false };
  const d = doc.data()!;
  return {
    connected: Boolean(d.accessToken),
    igUserId: d.igUserId,
    username: d.username,
    accessToken: d.accessToken,
    tokenExpiresAt: d.tokenExpiresAt,
    connectedAt: d.connectedAt,
    lastSyncAt: d.lastSyncAt,
    lastSyncCount: d.lastSyncCount,
  };
}

export async function setInstagramSettings(
  patch: Partial<InstagramSettings>,
): Promise<void> {
  const db = requireDb();
  await db.collection(SETTINGS).doc("instagram").set(patch, { merge: true });
}

export async function clearInstagramSettings(): Promise<void> {
  const db = requireDb();
  await db.collection(SETTINGS).doc("instagram").delete();
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderItem = {
  productId: string;
  name: string;
  size: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  status: "created" | "paid" | "failed";
  items: OrderItem[];
  amount: number; // INR whole rupees
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: number;
  paidAt?: number;
};

export async function createOrder(order: Omit<Order, "id">): Promise<string> {
  const db = requireDb();
  const ref = await db.collection(ORDERS).add(order);
  return ref.id;
}

export async function getOrder(id: string): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const doc = await db.collection(ORDERS).doc(id).get();
  return doc.exists ? ({ id: doc.id, ...(doc.data() as object) } as Order) : null;
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>,
): Promise<void> {
  const db = requireDb();
  await db.collection(ORDERS).doc(id).set(patch, { merge: true });
}

export async function findOrderByRazorpayId(
  razorpayOrderId: string,
): Promise<Order | null> {
  const db = getDb();
  if (!db) return null;
  const snap = await db
    .collection(ORDERS)
    .where("razorpayOrderId", "==", razorpayOrderId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as object) } as Order;
}
