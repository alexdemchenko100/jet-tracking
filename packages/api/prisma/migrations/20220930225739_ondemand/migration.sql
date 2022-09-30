/*
  Warnings:

  - You are about to drop the column `codeStatus` on the `MonitorResult` table. All the data in the column will be lost.
  - You are about to drop the column `codeStatus` on the `OndemandResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MonitorResult" DROP COLUMN "codeStatus";

-- AlterTable
ALTER TABLE "OndemandResult" DROP COLUMN "codeStatus";
