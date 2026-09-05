import { NextResponse } from "next/server";
import { checkPincodeServiceability, getExpectedTat } from "@/lib/delhivery";
import { isDelhiveryConfigured } from "@/lib/config";

// Public, read-only lookup — used both at checkout (soft warning if a PIN
// isn't serviceable) and on product pages (estimated delivery time).
// Never blocks anything on its own — best-effort, degrades to "not checked".
export async function GET(req: Request) {
  if (!isDelhiveryConfigured) {
    return NextResponse.json({ checked: false });
  }

  const { searchParams } = new URL(req.url);
  const pincode = (searchParams.get("pincode") || "").trim();
  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "Invalid PIN code" }, { status: 400 });
  }

  try {
    const result = await checkPincodeServiceability(pincode);
    let estimatedDays: number | null = null;
    if (result.serviceable) {
      try {
        estimatedDays = (await getExpectedTat(pincode)).days;
      } catch {
        /* TAT is a bonus — serviceability is the important part */
      }
    }
    return NextResponse.json({
      checked: true,
      serviceable: result.serviceable,
      codAvailable: result.codAvailable,
      estimatedDays,
    });
  } catch {
    // Delhivery hiccup — don't block checkout/browsing over it.
    return NextResponse.json({ checked: false });
  }
}
