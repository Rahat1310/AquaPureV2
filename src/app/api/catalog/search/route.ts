import { z } from "zod";

import {
  SEARCH_MIN_CHARS,
  searchProducts,
} from "@/features/catalog/queries";
import {
  apiOk,
  corsPreflightDenied,
  parseOrError,
  rejectIfCrossOrigin,
  withApiHandler,
} from "@/lib/api-route";

export const dynamic = "force-dynamic";

const searchQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(80, "Query too long.")
    .refine((v) => !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(v), {
      message: "Invalid query.",
    }),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

/**
 * GET /api/catalog/search?q=ro&limit=8
 * Debounced from the homepage search client.
 * Same-origin only; Prisma parameterized search (no raw SQL).
 */
export async function OPTIONS() {
  return corsPreflightDenied();
}

export async function GET(request: Request) {
  return withApiHandler("catalog/search", async () => {
    const blocked = rejectIfCrossOrigin(request);
    if (blocked) return blocked;

    const { searchParams } = new URL(request.url);
    const parsed = parseOrError(
      searchQuerySchema,
      {
        q: searchParams.get("q") ?? "",
        limit: searchParams.get("limit") ?? "8",
      },
      "catalog/search",
    );
    if ("response" in parsed) return parsed.response;

    const { q, limit } = parsed.data;

    if (q.length < SEARCH_MIN_CHARS) {
      return apiOk(
        { results: [], q },
        {
          headers: {
            "Cache-Control": "private, no-store",
            Vary: "Origin",
          },
        },
      );
    }

    // Prisma `contains` / parameterized — never string-concatenated SQL
    const results = await searchProducts(q, limit);

    return apiOk(
      { results, q },
      {
        headers: {
          "Cache-Control": "private, max-age=15",
          Vary: "Origin",
        },
      },
    );
  });
}
