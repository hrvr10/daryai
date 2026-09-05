import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/db";
import { createShipment, trackShipment } from "@/lib/delhivery";
import { isDelhiveryConfigured } from "@/lib/config";

// POST — create a Delhivery shipment (AWB) for this order.
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isDelhiveryConfigured) {
    return NextResponse.json(
      { error: "Delhivery is not configured on the server." },
      { status: 503 },
    );
  }

  const order = await getOrder(params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.delhivery?.waybill) {
    return NextResponse.json(
      { error: "A shipment already exists for this order." },
      { status: 400 },
    );
  }
  if (!order.customer.pincode) {
    return NextResponse.json(
      { error: "Order has no PIN code on file — can't create a shipment." },
      { status: 400 },
    );
  }

  const isCod = order.paymentMethod === "cod";
  const productsDescription = order.items
    .map((i) => `${i.name}${i.size ? ` (${i.size})` : ""} x${i.qty}`)
    .join(", ")
    .slice(0, 500);

  try {
    const result = await createShipment({
      orderId: order.id,
      name: order.customer.name,
      phone: order.customer.phone,
      address: order.customer.address,
      city: order.customer.city,
      state: order.customer.state,
      pin: order.customer.pincode,
      paymentMode: isCod ? "COD" : "Prepaid",
      // Cash still owed at delivery — 0 for a fully prepaid (Express) order.
      codAmount: isCod ? order.cashDueOnDelivery : undefined,
      totalAmount: order.amount,
      productsDescription,
      quantity: order.items.reduce((n, i) => n + i.qty, 0),
    });

    if (!result.success || !result.waybill) {
      const reason = result.message || "Delhivery did not return a waybill.";
      await updateOrder(order.id, {
        // `delhivery` is a nested map — spread the existing one so this
        // doesn't wipe out fields a merge write can't reach individually.
        delhivery: { ...order.delhivery, error: reason },
      });
      return NextResponse.json({ error: reason, raw: result.raw }, { status: 502 });
    }

    await updateOrder(order.id, {
      delhivery: {
        ...order.delhivery,
        waybill: result.waybill,
        createdAt: Date.now(),
      },
    });

    return NextResponse.json({ ok: true, waybill: result.waybill });
  } catch (err: any) {
    await updateOrder(order.id, {
      delhivery: { ...order.delhivery, error: err.message || "Shipment creation failed" },
    });
    return NextResponse.json(
      { error: err.message || "Shipment creation failed" },
      { status: 500 },
    );
  }
}

// PATCH — refresh tracking status for this order's existing shipment.
export async function PATCH(
  _req: Request,
  { params }: { params: { id: string } },
) {
  if (!isDelhiveryConfigured) {
    return NextResponse.json(
      { error: "Delhivery is not configured on the server." },
      { status: 503 },
    );
  }

  const order = await getOrder(params.id);
  if (!order?.delhivery?.waybill) {
    return NextResponse.json(
      { error: "No shipment on this order yet." },
      { status: 400 },
    );
  }

  try {
    const raw = await trackShipment(order.delhivery.waybill);
    const status =
      raw?.ShipmentData?.[0]?.Shipment?.Status?.Status ||
      raw?.packages?.[0]?.status ||
      "Unknown";
    await updateOrder(order.id, { delhivery: { ...order.delhivery, status } });
    return NextResponse.json({ ok: true, status, raw });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Tracking lookup failed" },
      { status: 500 },
    );
  }
}
