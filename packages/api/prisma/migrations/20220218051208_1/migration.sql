/*
  Warnings:

  - The `headers` column on the `Monitor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `headers` column on the `MonitorResult` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Monitor" DROP COLUMN "headers",
ADD COLUMN     "headers" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "MonitorResult" DROP COLUMN "headers",
ADD COLUMN     "headers" JSONB NOT NULL DEFAULT '[]';
