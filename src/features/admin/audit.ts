import "server-only";

import { prisma } from "@/lib/prisma";

interface AuditLogEntry {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: unknown;
  afterJson?: unknown;
}

/**
 * Creates an immutable audit log record for an administrative action.
 * Any write operation inside /admin should trigger this.
 */
export async function writeAuditLog({
  userId,
  action,
  entityType,
  entityId,
  beforeJson,
  afterJson,
}: AuditLogEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        beforeJson: beforeJson ? JSON.stringify(beforeJson) : null,
        afterJson: afterJson ? JSON.stringify(afterJson) : null,
      },
    });
  } catch (error) {
    // In a critical financial system, failure to audit might block the transaction.
    // For this e-commerce platform, we log to console but don't crash the app.
    console.error("[AUDIT LOG FAILED]", error);
  }
}
