"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SyncButton({
  disabled,
  hint,
}: {
  disabled?: boolean;
  hint?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function sync() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setMsg(
        `Synced ${data.total} reel${data.total === 1 ? "" : "s"} — ${data.created} new, ${data.updated} updated.`,
      );
      router.refresh();
    } catch (err: any) {
      setMsg(err.message || "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={sync}
        disabled={busy || disabled}
        className="rounded-md border border-neutral-800 bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        title={disabled ? hint : undefined}
      >
        {busy ? "Syncing…" : "Sync reels now"}
      </button>
      {msg && <p className="text-xs text-neutral-500">{msg}</p>}
    </div>
  );
}
