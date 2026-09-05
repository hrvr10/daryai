import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import SizeGuideDrawer from "@/components/SizeGuideDrawer";
import { AccordionItem } from "@/components/Accordion";
import { getProductById, listProducts } from "@/lib/db";
import { formatPrice } from "@/lib/products";

// Was force-dynamic, which also blocks Next's Link prefetching — every
// click did a full round trip (server render + Firestore fetch) with no
// head start. Products don't change second-to-second, so cache the page
// for a bit instead: first visit renders it, everyone after gets it
// instantly while a fresh copy revalidates in the background.
export const revalidate = 60;

// Pre-render every known product at build time so opening one is serving
// static HTML, not a cold render — that's what actually makes it instant.
// New products from the daily Instagram sync fall back to on-demand
// rendering (dynamicParams defaults to true) until the next deploy bakes
// them in too.
export async function generateStaticParams() {
  const ids: { id: string }[] = [];
  let cursor: string | null = null;
  do {
    const page = await listProducts({ limit: 48, cursor });
    ids.push(...page.items.map((p) => ({ id: p.id })));
    cursor = page.nextCursor;
  } while (cursor);
  return ids;
}

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  const slides = [
    ...(product.videoUrl
      ? [{ kind: "video" as const, src: product.videoUrl, poster: product.image }]
      : product.image
        ? [{ kind: "image" as const, src: product.image }]
        : []),
    ...(product.images || []).map((src) => ({ kind: "image" as const, src })),
  ];

  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-0 sm:py-10">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-brand-700"
      >
        ← Back to feed
      </Link>

      <div className="grid items-start gap-8 sm:grid-cols-2 sm:gap-12">
        <ProductGallery slides={slides} alt={product.name} />

        <div className="space-y-6">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.2em] text-brand-700">
              {product.source === "instagram" ? "New arrival" : "daryai"}
            </p>
            <h1 className="text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            {product.price > 0 && (
              <div className="mt-3 flex items-baseline gap-2 text-xl">
                <span className="font-medium">
                  {formatPrice(product.price, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-neutral-400 line-through">
                    {formatPrice(product.compareAtPrice!, product.currency)}
                  </span>
                )}
              </div>
            )}
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}

          <AddToCart product={product} />

          <div className="border-t border-neutral-200">
            <SizeGuideDrawer />
            <AccordionItem title="Shipping &amp; delivery">
              <ul className="list-disc space-y-1.5 pl-4">
                <li>Dispatched within 1–2 business days of your order.</li>
                <li>Delivered in 3–7 business days across India.</li>
                <li>Free shipping on every order.</li>
                <li>
                  Cash on delivery available — pay a small confirmation fee
                  online, the rest on arrival.
                </li>
                <li>
                  Tracking details are emailed to you as soon as your order
                  ships. Full policy on our{" "}
                  <a href="/shipping" className="underline hover:text-brand-700">
                    Shipping page
                  </a>
                  .
                </li>
              </ul>
            </AccordionItem>
            <AccordionItem title="Care instructions">
              <p>
                Machine wash cold with like colours. Do not bleach. Tumble
                dry low, or lay flat to dry for a longer life. Iron on low
                heat if needed, avoiding any prints or embellishments.
              </p>
            </AccordionItem>
          </div>

          {product.permalink && (
            <a
              href={product.permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-neutral-400 underline transition-colors hover:text-brand-700"
            >
              View original reel on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
