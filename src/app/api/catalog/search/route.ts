import { NextResponse } from "next/server";

import {
  SEARCH_MIN_CHARS,
  searchProducts,
} from "@/features/catalog/queries";

export const dynamic = "force-dynamic";

/**
 * GET /api/catalog/search?q=ro&limit=8
 * Debounced from the homepage search client.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const limitRaw = Number(searchParams.get("limit") ?? "8");
  const limit = Number.isFinite(limitRaw) ? limitRaw : 8;

  if (q.length < SEARCH_MIN_CHARS) {
    return NextResponse.json(
      { results: [], q },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      },
    );
  }

  const results = await searchProducts(q, limit);

  return NextResponse.json(
    { results, q },
    {
      headers: {
        // Short cache — search is read-heavy and safe to soft-cache
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    },
  );
}
