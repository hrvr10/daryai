import Link from "next/link";
import AdminBar from "@/components/admin/AdminBar";
import ProductRow from "@/components/admin/ProductRow";
import { listProducts, getInstagramSettings } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const { items } = await listProducts({ limit: 48, includeInactive: true });
  const ig = await getInstagramSettings().catch(() => ({ connected: false }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AdminBar active="products" />

      {!isFirebaseConfigured && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Firebase isn&apos;t configured, so you&apos;re seeing read-only seed
          products and edits won&apos;t save. Add the Firebase keys to{" "}
          <code>.env.local</code>.
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Products</h1>
        <span className="text-xs text-neutral-400">
          {ig.connected ? "Instagram connected" : "Instagram not connected"} ·{" "}
          <Link href="/admin/settings" className="underline">
            manage
          </Link>
        </span>
      </div>

      <p className="mb-2 text-xs text-neutral-400">
        Set a price and sizes, tick “Live” to show a reel in the shop. Reels sync
        in hidden until you price them.
      </p>

      <div>
        {items.length === 0 && (
          <p className="py-8 text-sm text-neutral-500">
            No products yet. Connect Instagram and sync your reels.
          </p>
        )}
        {items.map((p) => (
          <ProductRow key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
