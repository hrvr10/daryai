import { NextResponse } from "next/server";
import { adminConfig, isAdminConfigured } from "@/lib/config";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
} from "@/lib/adminAuth";

export async function POST(req: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Set ADMIN_PASSWORD in .env.local to use the admin panel." },
      { status: 503 },
    );
  }

  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || password !== adminConfig.password) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const token = await createAdminToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions);
  return res;
}
