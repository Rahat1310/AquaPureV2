import { redirect } from "next/navigation";

/** Catch RBAC failures from query helpers and redirect appropriately. */
export async function adminQuery<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") redirect("/admin/login");
      if (error.message === "FORBIDDEN") redirect("/admin");
    }
    throw error;
  }
}
