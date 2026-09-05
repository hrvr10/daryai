import AdminBar from "@/components/admin/AdminBar";
import OrderRow from "@/components/admin/OrderRow";
import { listOrders } from "@/lib/db";
import { isFirebaseConfigured, isDelhiveryConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = isFirebaseConfigured ? await listOrders(50) : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AdminBar active="orders" />

      {!isFirebaseConfigured && (
        <p className="mb-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Firebase isn&apos;t configured, so there&apos;s nothing to show —
          orders are stored in Firestore.
        </p>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Orders</h1>
        <span className="text-xs text-neutral-400">
          {isDelhiveryConfigured
            ? "Delhivery connected"
            : "Delhivery not configured"}
        </span>
      </div>

      {isFirebaseConfigured && orders.length === 0 && (
        <p className="py-8 text-sm text-neutral-500">No orders yet.</p>
      )}

      <ul>
        {orders.map((order) => (
          <OrderRow
            key={order.id}
            order={order}
            delhiveryConfigured={isDelhiveryConfigured}
          />
        ))}
      </ul>
    </div>
  );
}
