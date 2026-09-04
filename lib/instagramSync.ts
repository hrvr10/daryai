import "server-only";
import {
  getInstagramSettings,
  setInstagramSettings,
  upsertProductFromReel,
} from "./db";
import { fetchReels, refreshLongLivedToken } from "./instagram";

export type SyncResult = { total: number; created: number; updated: number };

/**
 * Pulls recent reels from the connected Instagram account and upserts them
 * as products. Shared by the admin "Sync reels now" button and the daily
 * cron job — same logic, different callers.
 */
export async function syncInstagramReels(): Promise<SyncResult> {
  const settings = await getInstagramSettings();
  if (!settings.connected || !settings.accessToken) {
    throw new Error("Instagram is not connected.");
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

  return { total: reels.length, created, updated };
}
