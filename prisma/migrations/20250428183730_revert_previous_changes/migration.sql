/*
  Warnings:

  - You are about to drop the `foodcourt_to_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `foodcourt_to_menu_categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `foodcourtId` to the `foodcourt_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "foodcourt_to_categories" DROP CONSTRAINT "foodcourt_to_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "foodcourt_to_categories" DROP CONSTRAINT "foodcourt_to_categories_foodcourtId_fkey";

-- DropForeignKey
ALTER TABLE "foodcourt_to_menu_categories" DROP CONSTRAINT "foodcourt_to_menu_categories_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "foodcourt_to_menu_categories" DROP CONSTRAINT "foodcourt_to_menu_categories_foodcourtId_fkey";

-- AlterTable
ALTER TABLE "foodcourt_categories" ADD COLUMN     "foodcourtId" TEXT NOT NULL;

-- DropTable
DROP TABLE "foodcourt_to_categories";

-- DropTable
DROP TABLE "foodcourt_to_menu_categories";

-- AddForeignKey
ALTER TABLE "foodcourt_categories" ADD CONSTRAINT "foodcourt_categories_foodcourtId_fkey" FOREIGN KEY ("foodcourtId") REFERENCES "foodcourts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
