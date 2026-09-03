import "server-only";
import { instagramConfig } from "./config";

// "Instagram API with Instagram Login" — lets a Business/Creator account
// authorize directly (no Facebook Page step) and read its own media.

const OAUTH_BASE = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH = "https://graph.instagram.com";

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: instagramConfig.appId,
    redirect_uri: instagramConfig.redirectUri,
    response_type: "code",
    scope: instagramConfig.scope,
    state,
  });
  return `${OAUTH_BASE}?${params.toString()}`;
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
    const msg =
      body?.error_message ||
      body?.error?.message ||
      body?.raw ||
      `Instagram request failed (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

export async function exchangeCodeForToken(code: string): Promise<{
  accessToken: string;
  userId: string;
  expiresAt: number;
}> {
  // 1. code -> short-lived token
  const form = new URLSearchParams({
    client_id: instagramConfig.appId,
    client_secret: instagramConfig.appSecret,
    grant_type: "authorization_code",
    redirect_uri: instagramConfig.redirectUri,
    code,
  });
  const shortRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const short = await readJson(shortRes);
  const shortToken: string = short.access_token;
  const userId = String(short.user_id ?? short.user?.id ?? "");

  // 2. short -> long-lived token (~60 days)
  const longRes = await fetch(
    `${GRAPH}/access_token?` +
      new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: instagramConfig.appSecret,
        access_token: shortToken,
      }),
  );
  const long = await readJson(longRes);
  const accessToken: string = long.access_token ?? shortToken;
  const expiresIn: number = Number(long.expires_in ?? 3600);

  return {
    accessToken,
    userId,
    expiresAt: Date.now() + expiresIn * 1000,
  };
}

export async function refreshLongLivedToken(token: string): Promise<{
  accessToken: string;
  expiresAt: number;
}> {
  const res = await fetch(
    `${GRAPH}/refresh_access_token?` +
      new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: token,
      }),
  );
  const body = await readJson(res);
  return {
    accessToken: body.access_token ?? token,
    expiresAt: Date.now() + Number(body.expires_in ?? 3600) * 1000,
  };
}

export async function getProfile(token: string): Promise<{
  userId: string;
  username: string;
}> {
  const res = await fetch(
    `${GRAPH}/me?` +
      new URLSearchParams({
        fields: "user_id,username",
        access_token: token,
      }),
  );
  const body = await readJson(res);
  return {
    userId: String(body.user_id ?? body.id ?? ""),
    username: body.username ?? "",
  };
}

export type Reel = {
  igMediaId: string;
  caption: string;
  thumbnailUrl: string;
  videoUrl?: string;
  permalink?: string;
  timestampMs: number;
};

/** Fetches recent media and returns only reels/videos. */
export async function fetchReels(
  token: string,
  maxPages = 5,
): Promise<Reel[]> {
  const fields =
    "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp";
  let url =
    `${GRAPH}/me/media?` +
    new URLSearchParams({ fields, access_token: token, limit: "50" });

  const reels: Reel[] = [];
  for (let page = 0; page < maxPages && url; page++) {
    const body = await readJson(await fetch(url));
    for (const m of body.data ?? []) {
      if (m.media_type !== "VIDEO") continue;
      reels.push({
        igMediaId: String(m.id),
        caption: m.caption ?? "",
        thumbnailUrl: m.thumbnail_url ?? m.media_url ?? "",
        videoUrl: m.media_url ?? undefined,
        permalink: m.permalink ?? undefined,
        timestampMs: m.timestamp ? Date.parse(m.timestamp) : Date.now(),
      });
    }
    url = body.paging?.next ?? "";
  }
  return reels;
}
