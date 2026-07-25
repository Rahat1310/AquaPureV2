-- Performance indexes for Order / OrderItem (Neon PostgreSQL free tier)
-- Speeds up account order lists, admin filters, and bKash TrxID lookups.

CREATE INDEX IF NOT EXISTS "Order_userId_idx" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx" ON "Order"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");
CREATE INDEX IF NOT EXISTS "Order_paymentMethod_idx" ON "Order"("paymentMethod");
CREATE INDEX IF NOT EXISTS "Order_addressId_idx" ON "Order"("addressId");
CREATE INDEX IF NOT EXISTS "Order_bkashTrxId_idx" ON "Order"("bkashTrxId");
CREATE INDEX IF NOT EXISTS "Order_createdAt_idx" ON "Order"("createdAt" DESC);

CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx" ON "OrderItem"("variantId");
