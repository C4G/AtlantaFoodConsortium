-- AlterTable
ALTER TABLE "NonprofitDocument"
ADD COLUMN "filePath" TEXT,
    ALTER COLUMN "fileData" DROP NOT NULL;