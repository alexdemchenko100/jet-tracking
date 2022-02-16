/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `MonitorResult` table. All the data in the column will be lost.
  - Added the required column `status` to the `Monitor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Monitor" ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MonitorResult" DROP COLUMN "updatedAt";
