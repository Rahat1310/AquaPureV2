import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client for Next.js serverless (Neon).
 * Reuses the client across hot reloads in dev to avoid exhausting connections.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/** Short interactive-transaction limits suitable for Neon free tier. */
export const ORDER_TX_OPTIONS = {
  maxWait: 5_000,
  timeout: 15_000,
} as const;
