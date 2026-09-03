import "server-only";
import crypto from "crypto";
import { razorpayConfig } from "./config";

const API = "https://api.razorpay.com/v1";

function authHeader(): string {
  const raw = `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`;
  return "Basic " + Buffer.from(raw).toString("base64");
}

export async function createRazorpayOrder(input: {
  amountInr: number; // whole rupees
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(input.amountInr * 100), // paise
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes ?? {},
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(
      body?.error?.description || `Razorpay order failed (${res.status})`,
    );
  }
  return { id: body.id, amount: body.amount, currency: body.currency };
}

/** Verifies the checkout handler signature: HMAC(order_id|payment_id). */
export function verifyPaymentSignature(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  const expected = crypto
    .createHmac("sha256", razorpayConfig.keySecret)
    .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
    .digest("hex");
  return safeEqual(expected, input.signature);
}

/** Verifies a Razorpay webhook payload against the webhook secret. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  if (!razorpayConfig.webhookSecret) return false;
  const expected = crypto
    .createHmac("sha256", razorpayConfig.webhookSecret)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}
