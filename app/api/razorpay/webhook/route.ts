import { NextResponse } from "next/server";
import { findOrderByRazorpayId, updateOrder } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { razorpayConfig } from "@/lib/config";

// Optional but recommended: configure this URL as a Razorpay webhook
// (events: payment.captured, payment.failed) with RAZORPAY_WEBHOOK_SECRET.
export async function POST(req: Request) {
  if (!razorpayConfig.webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const event = JSON.parse(raw);
  const entity = event?.payload?.payment?.entity;
  const razorpayOrderId = entity?.order_id;
  if (!razorpayOrderId) return NextResponse.json({ ok: true });

  const order = await findOrderByRazorpayId(razorpayOrderId);
  if (!order) return NextResponse.json({ ok: true });

  // COD: the payment.captured event here is only the ₹250 confirmation
  // fee — the order lands in "cod" (cash still due), not "paid".
  const paidStatus = order.paymentMethod === "cod" ? "cod" : "paid";

  if (event.event === "payment.captured" && order.status !== paidStatus) {
    await updateOrder(order.id, {
      status: paidStatus,
      razorpayPaymentId: entity.id,
      paidAt: Date.now(),
    });
  } else if (event.event === "payment.failed" && order.status === "created") {
    await updateOrder(order.id, { status: "failed" });
  }

  return NextResponse.json({ ok: true });
}
