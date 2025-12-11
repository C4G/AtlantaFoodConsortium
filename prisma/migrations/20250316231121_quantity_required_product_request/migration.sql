/*
  Warnings:

  - Made the column `quantity` on table `ProductRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProductRequest" ALTER COLUMN "quantity" SET NOT NULL;
