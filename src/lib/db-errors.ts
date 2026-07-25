import { Prisma } from "@prisma/client";

/**
 * Maps Prisma / Neon errors to safe, user-facing messages.
 * Never expose SQL, connection strings, or internal codes to clients.
 */
export class AppDbError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "DB_ERROR", status = 500) {
    super(message);
    this.name = "AppDbError";
    this.code = code;
    this.status = status;
  }
}

export class StockError extends AppDbError {
  constructor(productName: string, available: number) {
    super(
      `"${productName}" does not have enough stock. Available: ${available}`,
      "STOCK_INSUFFICIENT",
      409,
    );
    this.name = "StockError";
  }
}

export function toUserFacingDbError(err: unknown): AppDbError {
  if (err instanceof AppDbError) return err;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new AppDbError(
          "This order could not be created because a duplicate record already exists. Please try again.",
          "UNIQUE_CONSTRAINT",
          409,
        );
      case "P2003":
        return new AppDbError(
          "A related product or address is missing. Please refresh your cart and try again.",
          "FOREIGN_KEY",
          400,
        );
      case "P2025":
        return new AppDbError(
          "The requested record was not found.",
          "NOT_FOUND",
          404,
        );
      case "P2024":
      case "P1001":
      case "P1002":
      case "P1017":
        return new AppDbError(
          "Our database is busy right now. Please wait a moment and try again.",
          "CONNECTION",
          503,
        );
      default:
        console.error("[db]", err.code, err.message);
        return new AppDbError(
          "Something went wrong while saving your order. Please try again.",
          err.code,
          500,
        );
    }
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error("[db] init", err.message);
    return new AppDbError(
      "Unable to connect to the database. Please try again shortly.",
      "INIT",
      503,
    );
  }

  if (err instanceof Prisma.PrismaClientRustPanicError) {
    console.error("[db] panic", err.message);
    return new AppDbError(
      "A temporary database error occurred. Please try again.",
      "PANIC",
      500,
    );
  }

  if (err instanceof Error) {
    // Domain errors thrown from transactions (stock, validation)
    if (
      err.message.includes("stock") ||
      err.message.includes("Stock") ||
      err.name === "StockError"
    ) {
      return new AppDbError(err.message, "STOCK_INSUFFICIENT", 409);
    }
    console.error("[db] unexpected", err.message);
  } else {
    console.error("[db] unknown", err);
  }

  return new AppDbError(
    "Something went wrong. Please try again.",
    "UNKNOWN",
    500,
  );
}
