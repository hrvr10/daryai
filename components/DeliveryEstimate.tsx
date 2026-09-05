"use client";

import { useState } from "react";

export default function DeliveryEstimate() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "checking" | "ok" | "unserviceable" | "unknown"
  >("idle");
  const [estimatedDays, setEstimatedDays] = useState<number | null>(null);

  async function check(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pincode)) return;
    setStatus("checking");
    try {
      const res = await fetch(`/api/checkout/pincode-check?pincode=${pincode}`);
      const data = await res.json();
      if (!data.checked) {
        setStatus("unknown");
        return;
      }
      if (!data.serviceable) {
        setStatus("unserviceable");
        return;
      }
      setEstimatedDays(typeof data.estimatedDays === "number" ? data.estimatedDays : null);
      setStatus("ok");
    } catch {
      setStatus("unknown");
    }
  }

  return (
    <div>
      <div className="mb-1.5 text-sm font-medium">Estimated delivery</div>
      <form onSubmit={check} className="flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ""));
            setStatus("idle");
          }}
          placeholder="Enter PIN code"
          className="w-full max-w-[180px] rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        <button
          type="submit"
          disabled={status === "checking" || pincode.length !== 6}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {status === "checking" ? "…" : "Check"}
        </button>
      </form>

      {status === "ok" && (
        <p className="mt-2 text-sm text-green-700">
          {estimatedDays
            ? `Delivers in about ${estimatedDays} day${estimatedDays === 1 ? "" : "s"}.`
            : "This PIN code is serviceable."}
        </p>
      )}
      {status === "unserviceable" && (
        <p className="mt-2 text-sm text-red-600">
          Sorry, we can&apos;t currently deliver to this PIN code.
        </p>
      )}
      {status === "unknown" && (
        <p className="mt-2 text-sm text-neutral-400">
          Couldn&apos;t check delivery right now — you can still place your
          order.
        </p>
      )}
    </div>
  );
}
