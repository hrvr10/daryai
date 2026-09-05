"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/lib/db";

const statusLabel: Record<Order["status"], string> = {
  created: "Awaiting payment",
  paid: "Paid",
  cod: "COD confirmed",
  failed: "Failed",
};

const statusClass: Record<Order["status"], string> = {
  created: "bg-neutral-100 text-neutral-600",
  paid: "bg-green-50 text-green-700",
  cod: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
};

export default function OrderRow({
  order,
  delhiveryConfigured,
}: {
  order: Order;
  delhiveryConfigured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"create" | "track" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function createShipment() {
    setBusy("create");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/delhivery`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Shipment created — waybill ${data.waybill}`);
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function refreshTracking() {
    setBusy("track");
    setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/delhivery`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`Status: ${data.status}`);
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <li className="space-y-3 border-b border-neutral-200 py-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="font-mono text-xs text-neutral-400">{order.id}</div>
          <div className="text-sm font-medium">{order.customer.name}</div>
          <div className="text-xs text-neutral-500">
            {order.customer.email} · {order.customer.phone}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[order.status]}`}
        >
          {statusLabel[order.status]}
        </span>
      </div>

      <ul className="text-sm text-neutral-600">
        {order.items.map((it, i) => (
          <li key={i}>
            {it.name}
            {it.size ? ` · ${it.size}` : ""} × {it.qty} —{" "}
            {formatPrice(it.price * it.qty)}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-neutral-500">
        {order.paymentMethod === "cod" ? (
          <>
            <span>Paid online: {formatPrice(order.codFee || 0)}</span>
            <span className="font-medium text-amber-700">
              Cash due on delivery: {formatPrice(order.cashDueOnDelivery || 0)}
            </span>
          </>
        ) : (
          <span>Paid online: {formatPrice(order.amount)}</span>
        )}
        <span>{order.customer.address}</span>
      </div>

      {delhiveryConfigured && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {order.delhivery?.waybill ? (
            <>
              <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs">
                Waybill {order.delhivery.waybill}
                {order.delhivery.status ? ` · ${order.delhivery.status}` : ""}
              </span>
              <button
                type="button"
                onClick={refreshTracking}
                disabled={busy !== null}
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs disabled:opacity-50"
              >
                {busy === "track" ? "Checking…" : "Refresh tracking"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={createShipment}
              disabled={busy !== null || order.status === "created"}
              title={
                order.status === "created"
                  ? "Payment not confirmed yet"
                  : undefined
              }
              className="rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              {busy === "create" ? "Creating…" : "Create Delhivery shipment"}
            </button>
          )}
          {msg && <span className="text-xs text-neutral-500">{msg}</span>}
        </div>
      )}
      {order.delhivery?.error && (
        <p className="text-xs text-red-600">
          Last shipment error: {order.delhivery.error}
        </p>
      )}
    </li>
  );
}
