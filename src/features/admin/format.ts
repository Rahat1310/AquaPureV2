export function formatMoney(amount: number): string {
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString("en-BD", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  CLOSED_WON: "Converted",
  CLOSED_LOST: "Lost",
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const PRODUCT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  DRAFT: "Draft",
  DISCONTINUED: "Discontinued",
};

export const SERVICE_STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function roleLabel(role: string): string {
  return role.replaceAll("_", " ");
}
