/*
  Warnings:

  - Made the column `categoryId` on table `menu_items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_categoryId_fkey";

-- AlterTable
ALTER TABLE "menu_items" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateTable
CREATE TABLE "foodcourt_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "foodcourtId" TEXT NOT NULL,

    CONSTRAINT "foodcourt_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "foodcourt_categories" ADD CONSTRAINT "foodcourt_categories_foodcourtId_fkey" FOREIGN KEY ("foodcourtId") REFERENCES "foodcourts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
