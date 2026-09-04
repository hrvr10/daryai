"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/products";
import { indianStates } from "@/lib/indianStates";
import OrderSummary from "@/components/checkout/OrderSummary";

const RZP_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const trustLinks = [
  { href: "/returns", label: "Refund policy" },
  { href: "/shipping", label: "Shipping" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of service" },
  { href: "/contact", label: "Contact" },
];

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
    const get = (k: string) => String(form.get(k) || "").trim();

    const name = [get("firstName"), get("lastName")].filter(Boolean).join(" ");
    const address = [
      get("address1"),
      get("address2"),
      [get("city"), get("state")].filter(Boolean).join(", "),
      get("pincode"),
    ]
      .filter(Boolean)
      .join(", ");

    const customer = {
      name,
      email: get("email"),
      phone: get("phone"),
      address,
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
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-0 sm:py-8">
      <div className="grid gap-x-16 sm:grid-cols-2">
        {/* Mobile-only collapsed summary, above the form — like Shopify. */}
        <details className="group mb-2 rounded-md border border-neutral-200 sm:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="transition group-open:rotate-180"
                aria-hidden
              >
                <path
                  d="M1 3l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
              Show order summary
            </span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </summary>
          <div className="border-t border-neutral-200 p-4">
            <OrderSummary lines={lines} subtotal={subtotal} />
          </div>
        </details>

        {/* Desktop summary panel */}
        <div className="order-2 hidden sm:block">
          <div className="sticky top-20 rounded-md border border-neutral-200 bg-neutral-50 p-5">
            <OrderSummary lines={lines} subtotal={subtotal} />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="order-1 space-y-8 py-5 sm:py-0">
          <section>
            <h2 className="mb-3 text-base font-semibold">Contact</h2>
            <div className="space-y-3">
              <Field label="Email" name="email" type="email" autoComplete="email" required />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" required />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">Delivery</h2>
            <div className="space-y-3">
              <SelectField label="Country/Region" name="country" defaultValue="India">
                <option value="India">India</option>
              </SelectField>

              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" name="firstName" autoComplete="given-name" required />
                <Field label="Last name" name="lastName" autoComplete="family-name" required />
              </div>

              <Field
                label="Address"
                name="address1"
                autoComplete="address-line1"
                required
              />
              <Field
                label="Apartment, suite, etc. (optional)"
                name="address2"
                autoComplete="address-line2"
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="col-span-2 sm:col-span-1">
                  <Field label="City" name="city" autoComplete="address-level2" required />
                </div>
                <SelectField
                  label="State"
                  name="state"
                  defaultValue=""
                  autoComplete="address-level1"
                  required
                >
                  <option value="" disabled>
                    Choose
                  </option>
                  {indianStates.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </SelectField>
                <Field
                  label="PIN code"
                  name="pincode"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  autoComplete="postal-code"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold">Payment</h2>
            <p className="mb-3 text-xs text-neutral-500">
              All transactions are secure and encrypted.
            </p>
            <div className="rounded-md border border-neutral-800 bg-neutral-50 p-4">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Razorpay Secure (UPI, Cards, Netbanking, Wallets)</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                You&apos;ll complete payment in a secure Razorpay window.
              </p>
            </div>
          </section>

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

          <nav className="flex flex-wrap gap-x-4 gap-y-1 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
            {trustLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-black hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </form>
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

function SelectField({
  label,
  name,
  children,
  ...rest
}: {
  label: string;
  name: string;
  children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium" htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
