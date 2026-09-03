import Link from "next/link";
import { getOrder } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const order = searchParams.order
    ? await getOrder(searchParams.order)
    : null;

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="text-3xl">✓</div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {order?.status === "paid" ? "Payment received" : "Order placed"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {order
              ? `Thanks${
                  order.customer?.name
                    ? `, ${order.customer.name.split(" ")[0]}`
                    : ""
                }. A confirmation is on its way${
                  order.customer?.email ? ` to ${order.customer.email}` : ""
                }.`
              : "Thanks for your order."}
          </p>
        </div>

        {order && (
          <div className="space-y-3 rounded-md border border-neutral-200 p-4 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order</span>
              <span className="font-mono text-xs">{order.id}</span>
            </div>
            <ul className="space-y-1 border-t border-neutral-200 pt-3 text-neutral-600">
              {order.items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>
                    {it.name}
                    {it.size ? ` · ${it.size}` : ""} × {it.qty}
                  </span>
                  <span>{formatPrice(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t border-neutral-200 pt-3 font-medium">
              <span>Total</span>
              <span>{formatPrice(order.amount)}</span>
            </div>
            {order.customer?.address && (
              <div className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
                Ships to: {order.customer.address}
              </div>
            )}
          </div>
        )}

        <Link
          href="/"
          className="inline-block rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
