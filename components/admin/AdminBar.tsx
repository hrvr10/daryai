"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminBar({
  active,
}: {
  active: "products" | "orders" | "settings";
}) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/adminin/login");
    router.refresh();
  }

  return (
    <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-3">
      <nav className="flex gap-4 text-sm">
        <Link
          href="/adminin"
          className={
            active === "products" ? "font-semibold" : "text-neutral-500"
          }
        >
          Products
        </Link>
        <Link
          href="/adminin/orders"
          className={
            active === "orders" ? "font-semibold" : "text-neutral-500"
          }
        >
          Orders
        </Link>
        <Link
          href="/adminin/settings"
          className={
            active === "settings" ? "font-semibold" : "text-neutral-500"
          }
        >
          Instagram
        </Link>
        <Link href="/" className="text-neutral-500" target="_blank">
          View store ↗
        </Link>
      </nav>
      <button
        type="button"
        onClick={logout}
        className="text-sm text-neutral-500 underline"
      >
        Log out
      </button>
    </div>
  );
}
