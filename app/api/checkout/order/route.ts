import { NextResponse } from "next/server";
import { createOrder, getProductsByIds, type OrderItem } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { COD_FEE_INR } from "@/lib/products";
import {
  isRazorpayConfigured,
  isFirebaseConfigured,
  razorpayConfig,
} from "@/lib/config";

type IncomingItem = {
  productId: string;
  size: string;
  color?: string;
  qty: number;
};

export async function POST(req: Request) {
  if (!isFirebaseConfigured) {
    return NextResponse.json(
      { error: "Firebase is not configured — orders can't be stored." },
      { status: 503 },
    );
  }
  if (!isRazorpayConfigured) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server." },
      { status: 503 },
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentMethod: "online" | "cod" =
    body.paymentMethod === "cod" ? "cod" : "online";

  const rawItems: IncomingItem[] = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  const customer = {
    name: String(body.customer?.name ?? "").trim(),
    email: String(body.customer?.email ?? "").trim(),
    phone: String(body.customer?.phone ?? "").trim(),
    address: String(body.customer?.address ?? "").trim(),
    city: String(body.customer?.city ?? "").trim() || undefined,
    state: String(body.customer?.state ?? "").trim() || undefined,
    pincode: String(body.customer?.pincode ?? "").trim() || undefined,
  };
  if (!customer.name || !customer.email || !customer.address) {
    return NextResponse.json(
      { error: "Name, email and address are required" },
      { status: 400 },
    );
  }

  const ids = [...new Set(rawItems.map((i) => String(i.productId)))];
  const products = await getProductsByIds(ids);
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: OrderItem[] = [];
  for (const it of rawItems) {
    const p = byId.get(String(it.productId));
    const qty = Math.max(1, Math.min(20, Number(it.qty) || 1));
    if (!p) {
      return NextResponse.json(
        { error: `Product ${it.productId} not found` },
        { status: 400 },
      );
    }
    if (!p.active || p.price <= 0) {
      return NextResponse.json(
        { error: `"${p.name}" is not available for purchase` },
        { status: 400 },
      );
    }
    items.push({
      productId: p.id,
      name: p.name,
      size: String(it.size ?? ""),
      color: it.color ? String(it.color) : undefined,
      qty,
      price: p.price,
    });
  }

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const codFee = paymentMethod === "cod" ? COD_FEE_INR : 0;
  // Cash on delivery: only the ₹250 confirmation fee is charged online now;
  // the product amount is collected in cash when the order arrives. Online
  // ("Express"): the full amount is charged online, nothing due later.
  const payNowAmount = paymentMethod === "cod" ? codFee : itemsTotal;
  const cashDueOnDelivery = paymentMethod === "cod" ? itemsTotal : 0;

  try {
    const rzp = await createRazorpayOrder({
      amountInr: payNowAmount,
      receipt: `daryai_${Date.now()}`,
      notes: {
        email: customer.email,
        kind: paymentMethod === "cod" ? "cod_confirmation_fee" : "full_order",
      },
    });

    const orderId = await createOrder({
      status: "created",
      paymentMethod,
      codFee: paymentMethod === "cod" ? codFee : undefined,
      cashDueOnDelivery: paymentMethod === "cod" ? cashDueOnDelivery : undefined,
      items,
      amount: itemsTotal + codFee, // full order value across both charges
      currency: "INR",
      customer,
      razorpayOrderId: rzp.id,
      createdAt: Date.now(),
    });

    return NextResponse.json({
      orderId,
      paymentMethod,
      razorpayOrderId: rzp.id,
      amount: rzp.amount, // paise — what Razorpay charges right now
      currency: rzp.currency,
      keyId: razorpayConfig.publicKeyId,
      codFee,
      cashDueOnDelivery,
      customer,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Could not start payment" },
      { status: 500 },
    );
  }
}
