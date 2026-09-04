import { NextResponse } from "next/server";
import { syncInstagramReels } from "@/lib/instagramSync";

export const maxDuration = 60;

// Called once a day by Vercel Cron (see vercel.json). Vercel automatically
// sends `Authorization: Bearer $CRON_SECRET` on cron-triggered requests when
// CRON_SECRET is set as an env var, so we just check it matches.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncInstagramReels();
    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    // Don't fail loudly if Instagram just isn't connected yet — this runs
    // unattended every day regardless of setup state.
    return NextResponse.json({ ok: false, error: err.message || "Sync failed" });
  }
}
