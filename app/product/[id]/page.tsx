import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/ProductGallery";
import AddToCart from "@/components/AddToCart";
import SizeGuide from "@/components/SizeGuide";
import DeliveryEstimate from "@/components/DeliveryEstimate";
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
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-0 sm:py-8">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-black"
      >
        ← Back to feed
      </Link>

      <div className="grid gap-8 sm:grid-cols-2 sm:gap-10">
        <ProductGallery slides={slides} alt={product.name} />

        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.price > 0 && (
              <div className="mt-1 flex items-baseline gap-2 text-lg">
                <span>{formatPrice(product.price, product.currency)}</span>
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

          <div className="flex items-center gap-4 border-t border-neutral-200 pt-4">
            <SizeGuide />
          </div>

          <DeliveryEstimate />

          {product.permalink && (
            <a
              href={product.permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs text-neutral-400 underline"
            >
              View original reel on Instagram
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
