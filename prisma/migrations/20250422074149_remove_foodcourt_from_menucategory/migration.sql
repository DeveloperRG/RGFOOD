/*
  Warnings:

  - You are about to drop the column `foodcourtId` on the `menu_categories` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `menu_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "menu_categories" DROP CONSTRAINT "menu_categories_foodcourtId_fkey";

-- AlterTable
ALTER TABLE "menu_categories" DROP COLUMN "foodcourtId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
