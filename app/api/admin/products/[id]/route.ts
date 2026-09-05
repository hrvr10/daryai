import { NextResponse } from "next/server";
import { updateProduct, type ProductPatch } from "@/lib/db";
import type { SizeVariant } from "@/lib/products";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const patch: ProductPatch = {};

  if (body.price != null) {
    const price = Number(body.price);
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json({ error: "Bad price" }, { status: 400 });
    }
    patch.price = Math.round(price);
  }

  if (body.compareAtPrice !== undefined) {
    const cap = Number(body.compareAtPrice);
    patch.compareAtPrice =
      body.compareAtPrice === null || !Number.isFinite(cap) || cap <= 0
        ? undefined
        : Math.round(cap);
  }

  if (Array.isArray(body.sizes)) {
    patch.sizes = body.sizes
      .map(
        (s: any): SizeVariant => ({
          label: String(s.label ?? "").trim(),
          stock: Number.isFinite(Number(s.stock)) ? Number(s.stock) : 0,
        }),
      )
      .filter((s: SizeVariant) => s.label.length > 0);
  }

  if (Array.isArray(body.colors)) {
    patch.colors = body.colors
      .map((c: any) => String(c ?? "").trim())
      .filter((c: string) => c.length > 0)
      .slice(0, 20);
  }

  if (Array.isArray(body.images)) {
    patch.images = body.images
      .map((u: any) => String(u ?? "").trim())
      .filter((u: string) => u.length > 0)
      .slice(0, 12);
  }

  if (typeof body.active === "boolean") patch.active = body.active;
  if (typeof body.name === "string") patch.name = body.name.slice(0, 140);
  if (typeof body.description === "string")
    patch.description = body.description.slice(0, 2000);
  if (body.order != null && Number.isFinite(Number(body.order)))
    patch.order = Number(body.order);

  try {
    await updateProduct(params.id, patch);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Update failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
