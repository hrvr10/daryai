"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/products";

const RZP_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = RZP_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, count, clear } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (count === 0) {
    return (
      <div className="px-4 py-10 text-center text-sm text-neutral-500 sm:px-0">
        Your cart is empty.{" "}
        <Link href="/" className="font-medium text-black underline">
          Go shop
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const customer = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      address: String(form.get("address") || ""),
    };

    try {
      const res = await fetch("/api/checkout/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
            productId: l.id,
            size: l.size,
            qty: l.qty,
          })),
          customer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout");

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load Razorpay. Check your connection.");

      const rzp = new (window as any).Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: "daryai",
        description: `${count} item${count > 1 ? "s" : ""}`,
        prefill: {
          name: customer.name,
          email: customer.email,
          contact: customer.phone,
        },
        theme: { color: "#000000" },
        handler: async (resp: any) => {
          try {
            const vr = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature,
              }),
            });
            const vd = await vr.json();
            if (!vr.ok) throw new Error(vd.error || "Verification failed");
            clear();
            router.push(`/checkout/success?order=${vd.orderId}`);
          } catch (err: any) {
            setError(err.message || "Payment verification failed");
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => setBusy(false),
        },
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="px-4 py-5 sm:px-0">
      <h1 className="mb-4 text-xl font-semibold tracking-tight">Checkout</h1>

      <div className="grid gap-8 sm:grid-cols-2">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Full name" name="name" autoComplete="name" required />
          <Field
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
          <Field
            label="Phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
          />
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="address">
              Shipping address
            </label>
            <textarea
              id="address"
              name="address"
              required
              rows={3}
              autoComplete="street-address"
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-black px-4 py-3 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {busy ? "Starting payment…" : `Pay ${formatPrice(subtotal)}`}
          </button>
          <p className="text-xs text-neutral-400">
            Secure payment via Razorpay.
          </p>
        </form>

        <div className="space-y-3 rounded-md bg-neutral-50 p-4 text-sm">
          <div className="font-medium">Order summary</div>
          <ul className="space-y-2">
            {lines.map((line) => (
              <li
                key={`${line.id}-${line.size}`}
                className="flex justify-between gap-4 text-neutral-600"
              >
                <span>
                  {line.name}
                  {line.size ? ` · ${line.size}` : ""} × {line.qty}
                </span>
                <span>{formatPrice(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between border-t border-neutral-200 pt-3 font-medium">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        {...rest}
      />
    </div>
  );
}
