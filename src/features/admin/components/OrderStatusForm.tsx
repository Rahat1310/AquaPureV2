"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { initiateRefund, updateOrderStatus } from "@/features/admin/actions";
import { ORDER_STATUS_LABELS } from "@/features/admin/format";
import { Button } from "@/components/ui/button";

const STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatusFormProps = {
  orderId: string;
  currentStatus: string;
};

export function OrderStatusForm({
  orderId,
  currentStatus,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleStatusSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateOrderStatus({ orderId, status });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setMessage("Order status updated.");
      router.refresh();
    });
  }

  function handleRefundSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!confirm("Initiate refund for this order?")) return;
    startTransition(async () => {
      const result = await initiateRefund({ orderId, reason });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setReason("");
      setMessage("Refund initiated.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <form onSubmit={handleStatusSubmit} className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Update status</h3>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s] ?? s}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm" disabled={pending || status === currentStatus}>
          {pending ? "Saving…" : "Save status"}
        </Button>
      </form>

      <form
        onSubmit={handleRefundSubmit}
        className="space-y-3 border-t border-slate-200 pt-6"
      >
        <h3 className="text-sm font-bold text-slate-900">Initiate refund</h3>
        <p className="text-xs text-slate-500">
          Records a refund note and cancels the order when not yet delivered.
        </p>
        <textarea
          required
          minLength={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Refund reason…"
          className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          disabled={pending || currentStatus === "CANCELLED"}
        >
          Initiate refund
        </Button>
      </form>
    </div>
  );
}
