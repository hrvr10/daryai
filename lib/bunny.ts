import "server-only";
import { bunnyConfig, isBunnyConfigured } from "./config";

// Bunny Stream client. We never move video bytes ourselves — we hand Bunny
// the Instagram CDN URL and it downloads + transcodes on its side, then
// serves the result from its own global CDN (with a Singapore edge for
// India). Fixes both the slow mobile playback and the expiring-URL problem.

const API = "https://video.bunnycdn.com";

function headers(withBody = true): Record<string, string> {
  const h: Record<string, string> = {
    AccessKey: bunnyConfig.apiKey,
    accept: "application/json",
  };
  if (withBody) h["Content-Type"] = "application/json";
  return h;
}

/**
 * Create an empty video, then tell Bunny to pull `sourceUrl` into it.
 * Returns the new video GUID immediately; transcoding runs async on Bunny.
 */
export async function ingestVideo(
  sourceUrl: string,
  title: string,
): Promise<string> {
  if (!isBunnyConfigured) throw new Error("Bunny Stream is not configured.");

  const createRes = await fetch(
    `${API}/library/${bunnyConfig.libraryId}/videos`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ title: title.slice(0, 200) || "reel" }),
    },
  );
  if (!createRes.ok) {
    throw new Error(
      `Bunny create failed (${createRes.status}): ${await createRes.text()}`,
    );
  }
  const created = await createRes.json();
  const guid: string = created.guid;
  if (!guid) throw new Error("Bunny create returned no guid");

  const fetchRes = await fetch(
    `${API}/library/${bunnyConfig.libraryId}/videos/${guid}/fetch`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ url: sourceUrl }),
    },
  );
  if (!fetchRes.ok) {
    throw new Error(
      `Bunny fetch failed (${fetchRes.status}): ${await fetchRes.text()}`,
    );
  }
  return guid;
}

export type BunnyStatus = "pending" | "processing" | "ready" | "failed";

/** Bunny status codes: 0 created, 1 uploaded, 2 processing, 3 transcoding,
 *  4 finished, 5 error, 6 upload failed. */
export async function getVideoStatus(guid: string): Promise<BunnyStatus> {
  if (!isBunnyConfigured) throw new Error("Bunny Stream is not configured.");
  const res = await fetch(
    `${API}/library/${bunnyConfig.libraryId}/videos/${guid}`,
    { headers: headers(false) },
  );
  if (!res.ok) {
    throw new Error(
      `Bunny status failed (${res.status}): ${await res.text()}`,
    );
  }
  const data = await res.json();
  const s = Number(data.status);
  if (s === 4) return "ready";
  if (s === 5 || s === 6) return "failed";
  if (s === 2 || s === 3) return "processing";
  return "pending";
}

/** Direct MP4 URL for a finished Bunny video. Requires MP4 Fallback enabled
 *  for `bunnyConfig.mp4Resolution` in the library's encoding settings. */
export function bunnyMp4Url(guid: string): string {
  if (!bunnyConfig.hostname) return "";
  return `https://${bunnyConfig.hostname}/${guid}/play_${bunnyConfig.mp4Resolution}.mp4`;
}

export function bunnyThumbnailUrl(guid: string): string {
  if (!bunnyConfig.hostname) return "";
  return `https://${bunnyConfig.hostname}/${guid}/thumbnail.jpg`;
}
