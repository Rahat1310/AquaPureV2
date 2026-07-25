import { auth } from "@/auth";
import { getCartSummary } from "@/features/cart/queries";
import {
  apiOk,
  corsPreflightDenied,
  rejectIfCrossOrigin,
  withApiHandler,
} from "@/lib/api-route";

export const dynamic = "force-dynamic";

/**
 * GET /api/cart/summary
 * Current cart (auth user or guest cookie). Same-origin only.
 * No client body — session/cookie only. Prisma ORM for DB reads.
 */
export async function OPTIONS() {
  return corsPreflightDenied();
}

export async function GET(request: Request) {
  return withApiHandler("cart/summary", async () => {
    const blocked = rejectIfCrossOrigin(request);
    if (blocked) return blocked;

    const session = await auth();
    const userId = session?.user?.id ?? null;
    const summary = await getCartSummary(userId);

    return apiOk(summary, {
      headers: {
        "Cache-Control": "private, no-store",
        Vary: "Origin",
      },
    });
  });
}
