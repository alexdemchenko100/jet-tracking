/*
  Warnings:

  - Added the required column `monitorId` to the `MonitorResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MonitorResult" ADD COLUMN     "monitorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MonitorResult" ADD CONSTRAINT "MonitorResult_monitorId_fkey" FOREIGN KEY ("monitorId") REFERENCES "Monitor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
