-- Catalog / cart query indexes — reduce sequential scans on product pages & listings

CREATE INDEX IF NOT EXISTS "Category_parentId_idx" ON "Category"("parentId");

CREATE INDEX IF NOT EXISTS "Product_status_categoryId_idx" ON "Product"("status", "categoryId");
CREATE INDEX IF NOT EXISTS "Product_status_isFeatured_idx" ON "Product"("status", "isFeatured");
CREATE INDEX IF NOT EXISTS "Product_status_isBestSeller_idx" ON "Product"("status", "isBestSeller");
CREATE INDEX IF NOT EXISTS "Product_status_brand_idx" ON "Product"("status", "brand");
CREATE INDEX IF NOT EXISTS "Product_status_createdAt_idx" ON "Product"("status", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_idx" ON "ProductVariant"("productId");

CREATE INDEX IF NOT EXISTS "Review_productId_isApproved_idx" ON "Review"("productId", "isApproved");
CREATE INDEX IF NOT EXISTS "Review_userId_idx" ON "Review"("userId");

CREATE INDEX IF NOT EXISTS "CartItem_userId_idx" ON "CartItem"("userId");
CREATE INDEX IF NOT EXISTS "CartItem_productId_idx" ON "CartItem"("productId");
