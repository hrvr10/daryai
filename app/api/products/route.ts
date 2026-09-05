import { NextResponse } from "next/server";
import { listProducts } from "@/lib/db";

// Public product feed for the infinite-scroll grid.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Number(searchParams.get("limit") ?? "12");

  try {
    const page = await listProducts({
      limit: Number.isFinite(limit) ? limit : 12,
      cursor,
      includeInactive: false,
    });
    return NextResponse.json(page, {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load products" },
      { status: 500 },
    );
  }
}
