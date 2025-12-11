-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('PROTEIN', 'PRODUCE', 'SHELF_STABLE', 'SHELF_STABLE_INDIVIDUAL_SERVING', 'ALREADY_PREPARED_FOOD', 'OTHER');

-- CreateEnum
CREATE TYPE "ProteinType" AS ENUM ('FRESH', 'FROZEN', 'BEEF', 'SEAFOOD', 'POULTRY', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplierCadence" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'TBD');

-- CreateEnum
CREATE TYPE "DonateOrPurchase" AS ENUM ('DONATIONS', 'BUDGET_TO_PURCHASE');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('POUND', 'OUNCE', 'GALLON', 'QUART', 'PINT', 'LITER', 'KILOGRAM', 'COUNT', 'CASES', 'BAGS', 'BOXES', 'BOTTLES', 'JARS', 'CANS', 'SERVINGS');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'NEEDS_PICKUP', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "PickupTimeframe" AS ENUM ('MORNING', 'MIDDAY', 'AFTERNOON');

-- CreateEnum
CREATE TYPE "NonprofitOrganizationType" AS ENUM ('FOOD_BANK', 'PANTRY', 'STUDENT_PANTRY', 'FOOD_RESCUE', 'AGRICULTURE');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'SUPPLIER';
ALTER TYPE "UserRole" ADD VALUE 'NONPROFIT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "nonprofitId" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "productSurveyId" TEXT,
ADD COLUMN     "supplierId" TEXT,
ADD COLUMN     "title" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cadence" "SupplierCadence" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Nonprofit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationType" "NonprofitOrganizationType" NOT NULL,
    "nonprofitDocumentId" TEXT NOT NULL,
    "nonprofitDocumentApproval" BOOLEAN NOT NULL,
    "coldStorageSpace" BOOLEAN NOT NULL,
    "shelfSpace" BOOLEAN NOT NULL,
    "donationsOrPurchases" "DonateOrPurchase"[],
    "transportationAvailable" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nonprofit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductRequest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" "MeasurementUnit" NOT NULL,
    "quantity" INTEGER,
    "description" TEXT NOT NULL,
    "productTypeId" TEXT NOT NULL,
    "perishable" BOOLEAN NOT NULL DEFAULT false,
    "expirationDate" TIMESTAMP(3),
    "status" "ProductStatus" NOT NULL DEFAULT 'AVAILABLE',
    "supplierId" TEXT NOT NULL,
    "claimedById" TEXT,
    "pickupInfoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductType" (
    "id" TEXT NOT NULL,
    "protein" BOOLEAN,
    "proteinTypes" "ProteinType"[],
    "produce" BOOLEAN,
    "produceType" TEXT,
    "shelfStable" BOOLEAN,
    "shelfStableType" TEXT,
    "shelfStableIndividualServing" BOOLEAN,
    "shelfStableIndividualServingType" TEXT,
    "alreadyPreparedFood" BOOLEAN,
    "alreadyPreparedFoodType" TEXT,
    "other" BOOLEAN,
    "otherType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupInfo" (
    "id" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "pickupTimeframe" "PickupTimeframe"[],
    "pickupLocation" TEXT NOT NULL,
    "pickupInstructions" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NonprofitDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileData" BYTEA NOT NULL,
    "fileType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nonprofitId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NonprofitDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductInterests" (
    "id" TEXT NOT NULL,
    "protein" BOOLEAN,
    "proteinTypes" "ProteinType"[],
    "otherProteinType" TEXT,
    "produce" BOOLEAN,
    "produceType" TEXT,
    "shelfStable" BOOLEAN,
    "shelfStableType" TEXT,
    "shelfStableIndividualServing" BOOLEAN,
    "shelfStableIndividualServingType" TEXT,
    "alreadyPreparedFood" BOOLEAN,
    "alreadyPreparedFoodType" TEXT,
    "other" BOOLEAN,
    "otherType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductInterests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_name_key" ON "Nonprofit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Nonprofit_nonprofitDocumentId_key" ON "Nonprofit"("nonprofitDocumentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRequest_productTypeId_key" ON "ProductRequest"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRequest_pickupInfoId_key" ON "ProductRequest"("pickupInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "NonprofitDocument_nonprofitId_key" ON "NonprofitDocument"("nonprofitId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_productSurveyId_fkey" FOREIGN KEY ("productSurveyId") REFERENCES "ProductInterests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "Nonprofit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_pickupInfoId_fkey" FOREIGN KEY ("pickupInfoId") REFERENCES "PickupInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NonprofitDocument" ADD CONSTRAINT "NonprofitDocument_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("nonprofitDocumentId") ON DELETE CASCADE ON UPDATE CASCADE;
