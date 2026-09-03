import { NextResponse } from "next/server";
import { exchangeCodeForToken, getProfile } from "@/lib/instagram";
import { setInstagramSettings } from "@/lib/db";
import { siteUrl } from "@/lib/config";

function back(params: Record<string, string>) {
  const url = new URL("/admin/settings", siteUrl);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return NextResponse.redirect(url);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error_description") || searchParams.get("error");

  if (error) return back({ ig: "error", message: error });
  if (!code) return back({ ig: "error", message: "No code returned" });

  const expectedState = req.headers
    .get("cookie")
    ?.match(/ig_oauth_state=([^;]+)/)?.[1];
  if (!state || !expectedState || state !== expectedState) {
    return back({ ig: "error", message: "State mismatch — try again" });
  }

  try {
    const { accessToken, userId, expiresAt } = await exchangeCodeForToken(code);
    let username = "";
    try {
      username = (await getProfile(accessToken)).username;
    } catch {
      /* profile is best-effort */
    }
    await setInstagramSettings({
      accessToken,
      igUserId: userId,
      username,
      tokenExpiresAt: expiresAt,
      connectedAt: Date.now(),
    });
    const res = back({ ig: "connected" });
    res.cookies.set("ig_oauth_state", "", { path: "/", maxAge: 0 });
    return res;
  } catch (err: any) {
    return back({ ig: "error", message: err.message || "Token exchange failed" });
  }
}
