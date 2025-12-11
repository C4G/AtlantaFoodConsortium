/*
  Warnings:

  - The values [MIDDAY] on the enum `PickupTimeframe` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PickupTimeframe_new" AS ENUM ('MORNING', 'MID_DAY', 'AFTERNOON');
ALTER TABLE "PickupInfo" ALTER COLUMN "pickupTimeframe" TYPE "PickupTimeframe_new"[] USING ("pickupTimeframe"::text::"PickupTimeframe_new"[]);
ALTER TYPE "PickupTimeframe" RENAME TO "PickupTimeframe_old";
ALTER TYPE "PickupTimeframe_new" RENAME TO "PickupTimeframe";
DROP TYPE "PickupTimeframe_old";
COMMIT;
