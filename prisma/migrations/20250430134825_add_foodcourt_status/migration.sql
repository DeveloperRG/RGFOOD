/*
  Warnings:

  - A unique constraint covering the columns `[foodcourtId,category]` on the table `foodcourt_categories` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FoodcourtStatus" AS ENUM ('BUKA', 'TUTUP');

-- AlterTable
ALTER TABLE "foodcourts" ADD COLUMN     "status" "FoodcourtStatus" NOT NULL DEFAULT 'BUKA';

-- CreateIndex
CREATE UNIQUE INDEX "foodcourt_categories_foodcourtId_category_key" ON "foodcourt_categories"("foodcourtId", "category");
