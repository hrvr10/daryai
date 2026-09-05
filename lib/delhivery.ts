import "server-only";
import { delhiveryConfig } from "./config";

// Delhivery B2C API — https://one.delhivery.com/developer-portal/documents/b2c/
// staging-express.delhivery.com for testing, track.delhivery.com once your
// account is live on production. Every call uses `Authorization: Token ...`.

const BASE =
  delhiveryConfig.environment === "production"
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";

function authHeaders(extra?: Record<string, string>) {
  return {
    Authorization: `Token ${delhiveryConfig.apiToken}`,
    Accept: "application/json",
    ...extra,
  };
}

async function readJson(res: Response): Promise<any> {
  const text = await res.text();
  let body: any;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(
      body?.error || body?.rmk || body?.raw || `Delhivery request failed (${res.status})`,
    );
  }
  return body;
}

// ---------------------------------------------------------------------------
// Pincode serviceability — check before accepting an order for that address.
// ---------------------------------------------------------------------------

export type PincodeCheck = {
  serviceable: boolean;
  codAvailable: boolean;
  prepaidAvailable: boolean;
  raw: any;
};

export async function checkPincodeServiceability(
  pincode: string,
): Promise<PincodeCheck> {
  const url = `${BASE}/c/api/pin-codes/json/?filter_codes=${encodeURIComponent(pincode)}`;
  const res = await fetch(url, { headers: authHeaders() });
  const body = await readJson(res);
  const list: any[] = Array.isArray(body?.delivery_codes) ? body.delivery_codes : body;
  const entry = Array.isArray(list) ? list[0] : null;
  const postal = entry?.postal_code ?? entry;
  if (!postal) return { serviceable: false, codAvailable: false, prepaidAvailable: false, raw: body };

  // remark "Embargo" = temporarily non-serviceable even though it's listed.
  const embargoed = String(postal.remarks || "").toLowerCase().includes("embargo");
  return {
    serviceable: !embargoed,
    codAvailable: postal.cod === "Y" || postal.cash === "Y",
    prepaidAvailable: postal.pre_paid === "Y" || true,
    raw: body,
  };
}

// ---------------------------------------------------------------------------
// Client warehouse (pickup location) — one-time setup per pickup address.
// ---------------------------------------------------------------------------

export async function createClientWarehouse(input: {
  name: string; // becomes the pickup_location name used on every shipment
  phone: string;
  address: string;
  city?: string;
  pin: string;
  country?: string;
  email?: string;
  returnAddress: string;
  returnCity?: string;
  returnPin?: string;
  returnState?: string;
  returnCountry?: string;
}): Promise<any> {
  const res = await fetch(`${BASE}/api/backend/clientwarehouse/create/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({
      name: input.name,
      phone: input.phone,
      address: input.address,
      city: input.city,
      pin: input.pin,
      country: input.country || "India",
      email: input.email,
      return_address: input.returnAddress,
      return_city: input.returnCity,
      return_pin: input.returnPin,
      return_state: input.returnState,
      return_country: input.returnCountry || "India",
    }),
  });
  return readJson(res);
}

// ---------------------------------------------------------------------------
// Shipment creation — the core call, one per order.
// ---------------------------------------------------------------------------

// Standard packing: a plastic flyer/poly mailer, 20 x 20 x 7.5 cm, ~500 gm.
// Overridable per-shipment for the odd bulkier order.
const DEFAULT_PACKAGE = {
  lengthCm: 20,
  widthCm: 20,
  heightCm: 7.5,
  weightGrams: 500,
  plasticPackaging: true,
};

export type CreateShipmentInput = {
  orderId: string; // your own order id — must be unique per shipment
  name: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pin: string;
  paymentMode: "COD" | "Prepaid";
  codAmount?: number; // required when paymentMode is COD
  totalAmount: number;
  productsDescription: string;
  quantity?: number;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  plasticPackaging?: boolean;
  shippingMode?: "Surface" | "Express";
};

export type CreateShipmentResult = {
  waybill: string | null;
  success: boolean;
  raw: any;
};

export async function createShipment(
  input: CreateShipmentInput,
): Promise<CreateShipmentResult> {
  if (!delhiveryConfig.pickupLocation) {
    throw new Error("DELHIVERY_PICKUP_LOCATION is not set.");
  }

  const payload = {
    pickup_location: { name: delhiveryConfig.pickupLocation },
    shipments: [
      {
        name: input.name,
        order: input.orderId,
        phone: input.phone,
        add: input.address,
        pin: input.pin,
        city: input.city || "",
        state: input.state || "",
        country: "India",
        payment_mode: input.paymentMode,
        cod_amount: input.paymentMode === "COD" ? String(input.codAmount ?? 0) : "",
        total_amount: String(input.totalAmount),
        products_desc: input.productsDescription,
        quantity: String(input.quantity ?? 1),
        weight: String(input.weightGrams ?? DEFAULT_PACKAGE.weightGrams),
        shipment_length: String(input.lengthCm ?? DEFAULT_PACKAGE.lengthCm),
        shipment_width: String(input.widthCm ?? DEFAULT_PACKAGE.widthCm),
        shipment_height: String(input.heightCm ?? DEFAULT_PACKAGE.heightCm),
        plastic_packaging: input.plasticPackaging ?? DEFAULT_PACKAGE.plasticPackaging,
        shipping_mode: input.shippingMode || "Surface",
      },
    ],
  };

  // Delhivery's create endpoint is documented as a form-encoded body with a
  // `data` field holding the JSON string (not a raw JSON request body).
  const body = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;

  const res = await fetch(`${BASE}/api/cmu/create.json`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/x-www-form-urlencoded" }),
    body,
  });
  const raw = await readJson(res);

  // Response shape isn't documented with a sample on the developer portal;
  // this covers the field names Delhivery is known to return, but confirm
  // against a real response once a token is available and adjust if needed.
  const pkg = raw?.packages?.[0];
  const waybill = pkg?.waybill ?? raw?.waybill ?? null;
  const success = Boolean(raw?.success ?? pkg?.status === "Success" ?? waybill);

  return { waybill, success, raw };
}

// ---------------------------------------------------------------------------
// Tracking
// ---------------------------------------------------------------------------

export async function trackShipment(waybill: string): Promise<any> {
  const url = `${BASE}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`;
  const res = await fetch(url, { headers: authHeaders() });
  return readJson(res);
}

// ---------------------------------------------------------------------------
// Shipping label
// ---------------------------------------------------------------------------

export async function getShippingLabelUrl(
  waybill: string,
  size: "A4" | "4R" = "4R",
): Promise<string> {
  const url = `${BASE}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=${size}`;
  const res = await fetch(url, { headers: authHeaders() });
  const body = await readJson(res);
  return body?.packages?.[0]?.pdf_download_link || body?.pdf_download_link || "";
}
