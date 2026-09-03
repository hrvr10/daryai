import { NextResponse } from "next/server";
import { clearInstagramSettings } from "@/lib/db";

export async function POST() {
  try {
    await clearInstagramSettings();
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed" },
      { status: 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
