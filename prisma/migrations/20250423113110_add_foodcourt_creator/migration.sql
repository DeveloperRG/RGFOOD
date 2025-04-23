/*
  Warnings:

  - Added the required column `creatorId` to the `foodcourts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "foodcourts" DROP CONSTRAINT "foodcourts_ownerId_fkey";

-- AlterTable
ALTER TABLE "foodcourts" ADD COLUMN     "creatorId" TEXT NOT NULL,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "foodcourts" ADD CONSTRAINT "foodcourts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodcourts" ADD CONSTRAINT "foodcourts_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
