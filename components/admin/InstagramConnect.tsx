"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function InstagramConnect({
  connected,
  configured,
}: {
  connected: boolean;
  configured: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function disconnect() {
    setBusy(true);
    await fetch("/api/instagram/disconnect", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  if (!configured) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
        Set <code>INSTAGRAM_APP_ID</code> and <code>INSTAGRAM_APP_SECRET</code> in{" "}
        <code>.env.local</code>, then restart the server.
      </p>
    );
  }

  if (connected) {
    return (
      <button
        type="button"
        onClick={disconnect}
        disabled={busy}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-60"
      >
        {busy ? "…" : "Disconnect Instagram"}
      </button>
    );
  }

  return (
    <a
      href="/api/instagram/connect"
      className="inline-block rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
    >
      Connect Instagram
    </a>
  );
}
