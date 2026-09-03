"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      const next =
        new URLSearchParams(window.location.search).get("next") || "/admin";
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Login failed");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="mb-1 text-lg font-semibold">Admin</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Enter the admin password.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-black"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "…" : "Log in"}
        </button>
      </form>
    </div>
  );
}
