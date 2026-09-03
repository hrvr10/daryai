import { NextResponse } from "next/server";
import crypto from "crypto";
import { buildAuthorizeUrl } from "@/lib/instagram";
import { isInstagramConfigured } from "@/lib/config";

export async function GET() {
  if (!isInstagramConfigured) {
    return NextResponse.json(
      {
        error:
          "Set INSTAGRAM_APP_ID and INSTAGRAM_APP_SECRET in .env.local first.",
      },
      { status: 503 },
    );
  }

  const state = crypto.randomBytes(16).toString("hex");
  const res = NextResponse.redirect(buildAuthorizeUrl(state));
  res.cookies.set("ig_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });
  return res;
}
