import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const email = String(body?.email || "").trim().toLowerCase();
  const phone = String(body?.phone || "").trim();
  const honeypot = String(body?.company || "").trim();

  // A bot filled the hidden field. Say yes and drop it on the floor.
  if (honeypot) return NextResponse.json({ ok: true });

  if (!EMAIL.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  // Not configured yet — don't fail in front of a real visitor.
  if (!apiKey) {
    console.log("[daryai] signup (Brevo not configured):", email, phone || "-");
    return NextResponse.json({ ok: true, stored: false });
  }

  const attributes = {};
  if (phone) {
    // Brevo wants SMS in international format.
    const digits = phone.replace(/\D/g, "");
    if (digits.length >= 10) {
      attributes.SMS = digits.length === 10 ? `+91${digits}` : `+${digits}`;
    }
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds: listId ? [Number(listId)] : undefined,
        updateEnabled: true,
      }),
    });

    if (res.ok || res.status === 204) {
      return NextResponse.json({ ok: true, stored: true });
    }

    const detail = await res.json().catch(() => ({}));

    // Already subscribed is a success from the visitor's point of view.
    if (detail?.code === "duplicate_parameter") {
      return NextResponse.json({ ok: true, stored: true, duplicate: true });
    }

    console.error("[daryai] brevo error", res.status, detail);
    return NextResponse.json(
      { error: "Couldn't save that. Try again in a moment?" },
      { status: 502 }
    );
  } catch (err) {
    console.error("[daryai] brevo request failed", err);
    return NextResponse.json(
      { error: "Couldn't save that. Try again in a moment?" },
      { status: 502 }
    );
  }
}
