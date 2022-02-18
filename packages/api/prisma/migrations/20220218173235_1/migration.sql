/*
  Warnings:

  - Made the column `assertions` on table `Monitor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `env` on table `Monitor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Monitor" ALTER COLUMN "assertions" SET NOT NULL,
ALTER COLUMN "assertions" SET DEFAULT '[]',
ALTER COLUMN "env" SET NOT NULL,
ALTER COLUMN "env" SET DEFAULT '[]';
