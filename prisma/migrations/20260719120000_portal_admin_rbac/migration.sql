-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceRequest" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
