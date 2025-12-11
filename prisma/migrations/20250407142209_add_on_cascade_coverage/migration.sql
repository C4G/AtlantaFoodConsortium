-- DropForeignKey
ALTER TABLE "ProductRequest" DROP CONSTRAINT "ProductRequest_claimedById_fkey";

-- DropForeignKey
ALTER TABLE "ProductRequest" DROP CONSTRAINT "ProductRequest_pickupInfoId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRequest" DROP CONSTRAINT "ProductRequest_productTypeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRequest" DROP CONSTRAINT "ProductRequest_supplierId_fkey";

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "Nonprofit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRequest" ADD CONSTRAINT "ProductRequest_pickupInfoId_fkey" FOREIGN KEY ("pickupInfoId") REFERENCES "PickupInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
