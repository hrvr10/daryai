import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/adminAuth";

// Guards the admin panel and admin-only API routes.
const PROTECTED_API = [
  "/api/admin",
  "/api/instagram/connect",
  "/api/instagram/sync",
  "/api/instagram/disconnect",
];
// Public endpoints that live under a protected prefix.
const API_ALLOWLIST = ["/api/admin/login", "/api/admin/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isProtectedApi =
    !API_ALLOWLIST.includes(pathname) &&
    PROTECTED_API.some((p) => pathname.startsWith(p));

  if (!isAdminPage && !isProtectedApi) return NextResponse.next();

  const ok = await verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
  if (ok) return NextResponse.next();

  if (isProtectedApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/api/instagram/:path*"],
};
