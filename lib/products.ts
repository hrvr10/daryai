// Product type + seed data. Seed data is used only when Firestore is not
// configured, so the storefront always renders something.

/** Extra charge for paying cash on delivery instead of online. */
export const COD_FEE_INR = 250;

export type SizeVariant = {
  label: string;
  stock: number; // informational; not strictly enforced in this MVP
};

export type Product = {
  id: string;
  source: "seed" | "instagram" | "manual";
  name: string;
  price: number; // INR, whole rupees
  currency: string;
  /** Poster image: an Instagram thumbnail URL, or a /public path for seed. */
  image: string;
  /** Reel video URL when the product came from an Instagram reel. */
  videoUrl?: string;
  permalink?: string;
  description: string;
  sizes: SizeVariant[];
  active: boolean;
  /** Sort key — lower shows first. Instagram sync uses -timestamp. */
  order: number;
  createdAt: number;
  igMediaId?: string;
  syncedAt?: number;
};

export function formatPrice(inr: number, currency = "INR"): string {
  if (currency === "INR") return "₹" + Math.round(inr).toLocaleString("en-IN");
  return (
    currency +
    " " +
    Math.round(inr).toLocaleString("en-IN")
  );
}

const s = (labels: string[]): SizeVariant[] =>
  labels.map((label) => ({ label, stock: 10 }));

export const seedProducts: Product[] = [
  {
    id: "olive-oversized-tee",
    source: "seed",
    name: "Olive Oversized Tee",
    price: 1299,
    currency: "INR",
    image: "/products/olive-oversized-tee.jpg",
    description:
      "Heavyweight 240 GSM cotton, boxy fit, drop shoulder. Garment-dyed for a lived-in look.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 1,
    createdAt: 1,
  },
  {
    id: "washed-black-hoodie",
    source: "seed",
    name: "Washed Black Hoodie",
    price: 2499,
    currency: "INR",
    image: "/products/washed-black-hoodie.jpg",
    description:
      "Brushed fleece interior, relaxed body, double-layer hood. Acid-washed finish, no two exactly alike.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 2,
    createdAt: 2,
  },
  {
    id: "wide-leg-cargo",
    source: "seed",
    name: "Wide Leg Cargo",
    price: 2899,
    currency: "INR",
    image: "/products/wide-leg-cargo.jpg",
    description:
      "Cotton twill, six pockets, adjustable hem toggles. Sits at the waist with a full, easy leg.",
    sizes: s(["28", "30", "32", "34", "36"]),
    active: true,
    order: 3,
    createdAt: 3,
  },
  {
    id: "cream-linen-shirt",
    source: "seed",
    name: "Cream Linen Shirt",
    price: 1899,
    currency: "INR",
    image: "/products/cream-linen-shirt.jpg",
    description:
      "100% European linen, camp collar, mother-of-pearl buttons. Breathable and gets softer every wash.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 4,
    createdAt: 4,
  },
  {
    id: "faded-denim-jacket",
    source: "seed",
    name: "Faded Denim Jacket",
    price: 3499,
    currency: "INR",
    image: "/products/faded-denim-jacket.jpg",
    description:
      "14 oz rigid denim, stone-washed, boxy trucker cut. Contrast stitch and antique hardware.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 5,
    createdAt: 5,
  },
  {
    id: "ribbed-knit-polo",
    source: "seed",
    name: "Ribbed Knit Polo",
    price: 1699,
    currency: "INR",
    image: "/products/ribbed-knit-polo.jpg",
    description:
      "Fine-gauge cotton knit, three-button placket, slim collar. Wear it alone or as a layer.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 6,
    createdAt: 6,
  },
  {
    id: "pleated-trouser",
    source: "seed",
    name: "Pleated Trouser",
    price: 2599,
    currency: "INR",
    image: "/products/pleated-trouser.jpg",
    description:
      "Single-pleat front, tapered ankle, stretch wool blend. Dress it up or run it with sneakers.",
    sizes: s(["28", "30", "32", "34", "36"]),
    active: true,
    order: 7,
    createdAt: 7,
  },
  {
    id: "sand-crew-sweatshirt",
    source: "seed",
    name: "Sand Crew Sweatshirt",
    price: 1999,
    currency: "INR",
    image: "/products/sand-crew-sweatshirt.jpg",
    description:
      "Loopback French terry, ribbed cuffs, clean crew neck. Mid-weight, all-season staple.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 8,
    createdAt: 8,
  },
  {
    id: "utility-overshirt",
    source: "seed",
    name: "Utility Overshirt",
    price: 2799,
    currency: "INR",
    image: "/products/utility-overshirt.jpg",
    description:
      "Cotton canvas shacket, chest flap pockets, corozo buttons. Layer over a tee when it turns cold.",
    sizes: s(["S", "M", "L", "XL"]),
    active: true,
    order: 9,
    createdAt: 9,
  },
];
