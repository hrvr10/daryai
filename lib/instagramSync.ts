import "server-only";
import {
  getInstagramSettings,
  listInstagramProducts,
  setInstagramSettings,
  updateProduct,
  upsertProductFromReel,
} from "./db";
import { fetchReels, refreshLongLivedToken } from "./instagram";
import { isBunnyConfigured } from "./config";
import { getVideoStatus, ingestVideo } from "./bunny";

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

  await reconcileBunnyVideos();

  await setInstagramSettings({
    lastSyncAt: Date.now(),
    lastSyncCount: reels.length,
  });

  return { total: reels.length, created, updated };
}

/**
 * Copy reel videos onto our own CDN (Bunny Stream) so mobile playback is
 * fast and the Instagram URLs (which expire) stop being the live source.
 * Each sync: kick off ingestion for any reel not yet sent to Bunny, and
 * mark as ready any that Bunny has finished transcoding. Best-effort — a
 * Bunny failure must never break the Instagram sync.
 */
async function reconcileBunnyVideos(): Promise<void> {
  if (!isBunnyConfigured) return;
  let products;
  try {
    products = await listInstagramProducts();
  } catch (err) {
    console.error("Bunny reconcile: failed to list products", err);
    return;
  }

  for (const p of products) {
    try {
      if (p.videoUrl && !p.bunnyVideoId) {
        const guid = await ingestVideo(p.videoUrl, p.name);
        await updateProduct(p.id, { bunnyVideoId: guid });
      } else if (p.bunnyVideoId && !p.bunnyReady) {
        const status = await getVideoStatus(p.bunnyVideoId);
        if (status === "ready") {
          await updateProduct(p.id, { bunnyReady: true });
        }
      }
    } catch (err) {
      console.error(`Bunny reconcile failed for ${p.id}`, err);
    }
  }
}
