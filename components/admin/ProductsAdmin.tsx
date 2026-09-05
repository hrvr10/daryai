"use client";

import { useEffect, useMemo, useState } from "react";
import ProductRow, { type Draft, type SaveState } from "./ProductRow";
import type { Product } from "@/lib/products";

function draftOf(p: Product): Draft {
  return {
    name: p.name,
    description: p.description || "",
    price: String(p.price || ""),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
    sizes: p.sizes.map((s) => s.label).join(", "),
    colors: (p.colors || []).join(", "),
    images: p.images || [],
    active: p.active,
  };
}

function toPatch(draft: Draft) {
  return {
    name: draft.name,
    description: draft.description,
    price: Number(draft.price) || 0,
    compareAtPrice: draft.compareAtPrice ? Number(draft.compareAtPrice) : null,
    sizes: draft.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label, stock: 10 })),
    colors: draft.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    images: draft.images,
    active: draft.active,
  };
}

async function patchProduct(id: string, body: unknown) {
  const res = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Save failed");
}

export default function ProductsAdmin({ products }: { products: Product[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(products.map((p) => [p.id, draftOf(p)])),
  );
  const [dirty, setDirty] = useState<Set<string>>(new Set());
  const [saveState, setSaveState] = useState<Record<string, SaveState>>({});
  const [errorMsg, setErrorMsg] = useState<Record<string, string>>({});
  const [bulkBusy, setBulkBusy] = useState<"save" | "live" | "hide" | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const dirtyCount = dirty.size;
  const liveCount = useMemo(
    () => Object.values(drafts).filter((d) => d.active).length,
    [drafts],
  );

  function updateDraft(id: string, patch: Partial<Draft>) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }));
    setDirty((s) => new Set(s).add(id));
  }

  async function saveOne(id: string): Promise<boolean> {
    setSaveState((s) => ({ ...s, [id]: "saving" }));
    try {
      await patchProduct(id, toPatch(drafts[id]));
      setSaveState((s) => ({ ...s, [id]: "saved" }));
      setDirty((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setTimeout(
        () => setSaveState((s) => (s[id] === "saved" ? { ...s, [id]: "idle" } : s)),
        1500,
      );
      return true;
    } catch (err: any) {
      setSaveState((s) => ({ ...s, [id]: "error" }));
      setErrorMsg((s) => ({ ...s, [id]: err.message || "Save failed" }));
      return false;
    }
  }

  async function saveAll() {
    setBulkBusy("save");
    const ids = Object.keys(drafts);
    const results = await Promise.all(ids.map((id) => saveOne(id)));
    const okCount = results.filter(Boolean).length;
    setToast(
      okCount === ids.length
        ? `Saved ${okCount} product${okCount === 1 ? "" : "s"}.`
        : `Saved ${okCount} of ${ids.length} — check the ones flagged in red.`,
    );
    setBulkBusy(null);
  }

  async function setAllLive(active: boolean) {
    setBulkBusy(active ? "live" : "hide");
    const ids = Object.keys(drafts);
    setDrafts((d) => {
      const next = { ...d };
      for (const id of ids) next[id] = { ...next[id], active };
      return next;
    });
    const results = await Promise.all(
      ids.map(async (id) => {
        setSaveState((s) => ({ ...s, [id]: "saving" }));
        try {
          await patchProduct(id, { active });
          setSaveState((s) => ({ ...s, [id]: "saved" }));
          setDirty((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          });
          setTimeout(
            () =>
              setSaveState((s) => (s[id] === "saved" ? { ...s, [id]: "idle" } : s)),
            1500,
          );
          return true;
        } catch (err: any) {
          setSaveState((s) => ({ ...s, [id]: "error" }));
          setErrorMsg((s) => ({ ...s, [id]: err.message || "Save failed" }));
          return false;
        }
      }),
    );
    const okCount = results.filter(Boolean).length;
    setToast(
      `${okCount} product${okCount === 1 ? "" : "s"} ${active ? "are now live" : "hidden"}.`,
    );
    setBulkBusy(null);
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg bg-neutral-50 p-3">
        <button
          type="button"
          onClick={saveAll}
          disabled={bulkBusy !== null}
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {bulkBusy === "save" ? "Saving all…" : "Save all"}
        </button>
        <button
          type="button"
          onClick={() => setAllLive(true)}
          disabled={bulkBusy !== null}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-neutral-400 disabled:opacity-60"
        >
          {bulkBusy === "live" ? "Making live…" : "Make all live"}
        </button>
        <button
          type="button"
          onClick={() => setAllLive(false)}
          disabled={bulkBusy !== null}
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium hover:border-neutral-400 disabled:opacity-60"
        >
          {bulkBusy === "hide" ? "Hiding all…" : "Hide all"}
        </button>
        <span className="ml-auto text-xs text-neutral-500">
          {liveCount} of {products.length} live
          {dirtyCount > 0 && (
            <span className="ml-2 text-amber-600">
              · {dirtyCount} unsaved
            </span>
          )}
        </span>
      </div>

      {toast && (
        <div className="mb-4 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          {toast}
        </div>
      )}

      <div className="space-y-2">
        {products.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            draft={drafts[p.id]}
            dirty={dirty.has(p.id)}
            saveState={saveState[p.id] || "idle"}
            errorMsg={errorMsg[p.id]}
            onChange={(patch) => updateDraft(p.id, patch)}
            onSave={() => saveOne(p.id)}
          />
        ))}
      </div>
    </div>
  );
}
