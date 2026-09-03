import { NextResponse } from "next/server";
import {
  getInstagramSettings,
  setInstagramSettings,
  upsertProductFromReel,
} from "@/lib/db";
import { fetchReels, refreshLongLivedToken } from "@/lib/instagram";

export async function POST() {
  const settings = await getInstagramSettings();
  if (!settings.connected || !settings.accessToken) {
    return NextResponse.json(
      { error: "Instagram is not connected." },
      { status: 400 },
    );
  }

  let token = settings.accessToken;

  // Refresh if the long-lived token is within 7 days of expiry.
  if (
    settings.tokenExpiresAt &&
    settings.tokenExpiresAt - Date.now() < 7 * 24 * 60 * 60 * 1000
  ) {
    try {
      const refreshed = await refreshLongLivedToken(token);
      token = refreshed.accessToken;
      await setInstagramSettings({
        accessToken: refreshed.accessToken,
        tokenExpiresAt: refreshed.expiresAt,
      });
    } catch {
      /* keep using the existing token */
    }
  }

  try {
    const reels = await fetchReels(token);
    let created = 0;
    let updated = 0;
    for (const reel of reels) {
      const r = await upsertProductFromReel(reel);
      if (r === "created") created++;
      else updated++;
    }
    await setInstagramSettings({
      lastSyncAt: Date.now(),
      lastSyncCount: reels.length,
    });
    return NextResponse.json({
      ok: true,
      total: reels.length,
      created,
      updated,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Sync failed" },
      { status: 500 },
    );
  }
}
