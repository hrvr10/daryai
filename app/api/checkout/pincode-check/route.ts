import { NextResponse } from "next/server";
import { checkPincodeServiceability } from "@/lib/delhivery";
import { isDelhiveryConfigured } from "@/lib/config";

// Public, read-only lookup used to show a soft warning at checkout if a PIN
// code isn't serviceable. Never blocks checkout on its own — best-effort.
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
    return NextResponse.json({
      checked: true,
      serviceable: result.serviceable,
      codAvailable: result.codAvailable,
    });
  } catch {
    // Delhivery hiccup — don't block checkout over it.
    return NextResponse.json({ checked: false });
  }
}
