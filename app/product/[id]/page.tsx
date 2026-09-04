import Link from "next/link";
import { notFound } from "next/navigation";
import ProductImage from "@/components/ProductImage";
import AddToCart from "@/components/AddToCart";
import { getProductById } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div className="px-4 py-5 sm:px-0">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-neutral-500 hover:text-black"
      >
        ← Back to feed
      </Link>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-[9/16] overflow-hidden rounded-md bg-neutral-100">
          {product.videoUrl ? (
            <video
              src={product.videoUrl}
              poster={product.image || undefined}
              controls
              playsInline
              loop
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <ProductImage
              src={product.image}
              alt={product.name}
              className="h-full w-full"
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {product.name}
            </h1>
            {product.price > 0 && (
              <div className="mt-1 text-lg">
                {formatPrice(product.price, product.currency)}
              </div>
            )}
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-600">
              {product.description}
            </p>
          )}

          <AddToCart product={product} />

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
