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
  const isCod = order?.paymentMethod === "cod";
  const cashDue = order?.cashDueOnDelivery || 0;

  return (
    <div className="px-4 py-8 sm:px-0">
      <div className="mx-auto max-w-md space-y-6 text-center">
        <div className="text-3xl">✓</div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            {isCod
              ? "Order confirmed"
              : order?.status === "paid"
                ? "Payment received"
                : "Order placed"}
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

        {isCod && (
          <div className="rounded-md bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
            <span className="font-semibold">{formatPrice(order!.codFee || 0)}</span>{" "}
            confirmation fee charged online. Pay the remaining{" "}
            <span className="font-semibold">{formatPrice(cashDue)}</span> in
            cash when your order arrives.
          </div>
        )}

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
              {isCod && order.codFee ? (
                <li className="flex justify-between gap-4">
                  <span>COD confirmation fee</span>
                  <span>{formatPrice(order.codFee)}</span>
                </li>
              ) : null}
            </ul>
            {isCod ? (
              <div className="space-y-1 border-t border-neutral-200 pt-3 font-medium">
                <div className="flex justify-between">
                  <span>Paid online</span>
                  <span>{formatPrice(order.codFee || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due on delivery (cash)</span>
                  <span>{formatPrice(cashDue)}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between border-t border-neutral-200 pt-3 font-medium">
                <span>Total</span>
                <span>{formatPrice(order.amount)}</span>
              </div>
            )}
            <div className="border-t border-neutral-200 pt-3 text-xs text-neutral-500">
              Payment:{" "}
              {isCod
                ? `${formatPrice(order.codFee || 0)} paid online (Razorpay) · ${formatPrice(cashDue)} cash on delivery`
                : "Paid online via Razorpay"}
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
