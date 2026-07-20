import { QuotesTable } from "@/features/admin/components/QuotesTable";
import { adminQuery } from "@/features/admin/guard";
import {
  listQuoteRequests,
  listSalesReps,
} from "@/features/admin/queries";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
}>;

export default async function AdminQuotesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const status = params.status?.trim() || undefined;

  const [quotes, salesReps] = await Promise.all([
    adminQuery(() =>
      listQuoteRequests({
        q,
        status: status as
          | "NEW"
          | "CONTACTED"
          | "CLOSED_WON"
          | "CLOSED_LOST"
          | undefined,
      }),
    ),
    adminQuery(() => listSalesReps()),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Quote requests
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track commercial leads — New, Contacted, Converted, or Lost.
        </p>
      </div>

      <QuotesTable
        quotes={quotes}
        salesReps={salesReps}
        q={q ?? ""}
        status={status ?? ""}
      />
    </div>
  );
}
