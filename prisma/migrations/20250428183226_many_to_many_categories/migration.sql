/*
  Warnings:

  - You are about to drop the column `foodcourtId` on the `foodcourt_categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "foodcourt_categories" DROP CONSTRAINT "foodcourt_categories_foodcourtId_fkey";

-- AlterTable
ALTER TABLE "foodcourt_categories" DROP COLUMN "foodcourtId";

-- CreateTable
CREATE TABLE "foodcourt_to_categories" (
    "foodcourtId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "foodcourt_to_categories_pkey" PRIMARY KEY ("foodcourtId","categoryId")
);

-- CreateTable
CREATE TABLE "foodcourt_to_menu_categories" (
    "foodcourtId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "foodcourt_to_menu_categories_pkey" PRIMARY KEY ("foodcourtId","categoryId")
);

-- AddForeignKey
ALTER TABLE "foodcourt_to_categories" ADD CONSTRAINT "foodcourt_to_categories_foodcourtId_fkey" FOREIGN KEY ("foodcourtId") REFERENCES "foodcourts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodcourt_to_categories" ADD CONSTRAINT "foodcourt_to_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "foodcourt_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodcourt_to_menu_categories" ADD CONSTRAINT "foodcourt_to_menu_categories_foodcourtId_fkey" FOREIGN KEY ("foodcourtId") REFERENCES "foodcourts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foodcourt_to_menu_categories" ADD CONSTRAINT "foodcourt_to_menu_categories_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "menu_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
