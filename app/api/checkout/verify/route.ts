import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    orderId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const order = await getOrder(String(orderId));
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await updateOrder(order.id, { status: "failed" });
    return NextResponse.json({ error: "Signature check failed" }, { status: 400 });
  }

  // COD: this payment was just the ₹250 confirmation fee, not the full
  // order — the rest is still owed in cash at delivery.
  const newStatus = order.paymentMethod === "cod" ? "cod" : "paid";

  await updateOrder(order.id, {
    status: newStatus,
    razorpayPaymentId: razorpay_payment_id,
    paidAt: Date.now(),
  });

  return NextResponse.json({ ok: true, orderId: order.id });
}
