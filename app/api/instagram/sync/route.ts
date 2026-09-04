import { NextResponse } from "next/server";
import { syncInstagramReels } from "@/lib/instagramSync";

// Manual sync, triggered by the admin "Sync reels now" button.
// Guarded by middleware.ts (requires the admin session cookie).
export async function POST() {
  try {
    const result = await syncInstagramReels();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Sync failed" },
      { status: 500 },
    );
  }
}
