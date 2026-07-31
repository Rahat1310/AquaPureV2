-- Adds the Order columns that were missing from 20260722023000_add_order_payment_bkash.
-- paymentMethod was referenced by 20260723040000_order_performance_indexes but never created,
-- causing P3006 on shadow-database replay. Also backfills the other checkout metadata fields
-- that schema.prisma declares but no migration has ever emitted.

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod"      TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveryOption"     TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "installationOption" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "transactionRef"     TEXT;

-- transactionRef has @unique in schema.prisma
CREATE UNIQUE INDEX IF NOT EXISTS "Order_transactionRef_key" ON "Order"("transactionRef");
