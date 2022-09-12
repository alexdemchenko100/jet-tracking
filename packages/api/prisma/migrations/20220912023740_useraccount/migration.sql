/*
  Warnings:

  - You are about to drop the column `isCurrentAccount` on the `UserAccount` table. All the data in the column will be lost.
  - You are about to drop the `NotificationEmail` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name,owner]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `owner` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotificationEmail" DROP CONSTRAINT "NotificationEmail_accountId_fkey";

-- DropIndex
DROP INDEX "Account_name_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "owner" TEXT NOT NULL,
ALTER COLUMN "name" SET DEFAULT '';

-- AlterTable
ALTER TABLE "UserAccount" DROP COLUMN "isCurrentAccount",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tokenExpiryAt" TIMESTAMP(3),
ALTER COLUMN "userId" SET DEFAULT '';

-- DropTable
DROP TABLE "NotificationEmail";

-- CreateIndex
CREATE UNIQUE INDEX "Account_name_owner_key" ON "Account"("name", "owner");
