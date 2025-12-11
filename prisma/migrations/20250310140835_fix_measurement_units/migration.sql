/*
  Warnings:

  - The values [POUND,OUNCE,GALLON,QUART,PINT,LITER,KILOGRAM] on the enum `MeasurementUnit` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MeasurementUnit_new" AS ENUM ('POUNDS', 'OUNCES', 'GALLONS', 'QUARTS', 'PINTS', 'LITERS', 'KILOGRAMS', 'COUNT', 'CASES', 'BAGS', 'BOXES', 'BOTTLES', 'JARS', 'CANS', 'SERVINGS');
ALTER TABLE "ProductRequest" ALTER COLUMN "unit" TYPE "MeasurementUnit_new" USING ("unit"::text::"MeasurementUnit_new");
ALTER TYPE "MeasurementUnit" RENAME TO "MeasurementUnit_old";
ALTER TYPE "MeasurementUnit_new" RENAME TO "MeasurementUnit";
DROP TYPE "MeasurementUnit_old";
COMMIT;
