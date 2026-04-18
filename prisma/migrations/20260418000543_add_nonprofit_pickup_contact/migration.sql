-- AlterTable
ALTER TABLE "ProductRequest" ADD COLUMN     "nonprofitPickupContactName" TEXT,
ADD COLUMN     "nonprofitPickupContactPhone" TEXT,
ADD COLUMN     "nonprofitPickupDate" TIMESTAMP(3),
ADD COLUMN     "nonprofitPickupTimeframe" "PickupTimeframe"[];
