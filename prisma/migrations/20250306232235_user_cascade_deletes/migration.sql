-- DropForeignKey
ALTER TABLE "Nonprofit" DROP CONSTRAINT "Nonprofit_nonprofitDocumentId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_nonprofitId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_productSurveyId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_supplierId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_nonprofitId_fkey" FOREIGN KEY ("nonprofitId") REFERENCES "Nonprofit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_productSurveyId_fkey" FOREIGN KEY ("productSurveyId") REFERENCES "ProductInterests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nonprofit" ADD CONSTRAINT "Nonprofit_nonprofitDocumentId_fkey" FOREIGN KEY ("nonprofitDocumentId") REFERENCES "NonprofitDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
