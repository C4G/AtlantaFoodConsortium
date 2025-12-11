/*
  Warnings:

  - You are about to drop the column `nonprofitId` on the `NonprofitDocument` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "NonprofitDocument" DROP CONSTRAINT "NonprofitDocument_nonprofitId_fkey";

-- DropIndex
DROP INDEX "NonprofitDocument_nonprofitId_key";

-- AlterTable
ALTER TABLE "NonprofitDocument" DROP COLUMN "nonprofitId";

-- AddForeignKey
ALTER TABLE "Nonprofit" ADD CONSTRAINT "Nonprofit_nonprofitDocumentId_fkey" FOREIGN KEY ("nonprofitDocumentId") REFERENCES "NonprofitDocument"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
