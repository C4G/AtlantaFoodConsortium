/*
  Warnings:

  - The values [NEEDS_PICKUP,NEEDS_REVIEW] on the enum `ProductStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductStatus_new" AS ENUM ('AVAILABLE', 'RESERVED', 'PENDING');
ALTER TABLE "ProductRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProductRequest" ALTER COLUMN "status" TYPE "ProductStatus_new" USING ("status"::text::"ProductStatus_new");
ALTER TYPE "ProductStatus" RENAME TO "ProductStatus_old";
ALTER TYPE "ProductStatus_new" RENAME TO "ProductStatus";
DROP TYPE "ProductStatus_old";
ALTER TABLE "ProductRequest" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
COMMIT;
