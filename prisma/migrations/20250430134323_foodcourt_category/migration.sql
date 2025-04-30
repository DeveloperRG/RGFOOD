/*
  Warnings:

  - You are about to drop the column `description` on the `foodcourt_categories` table. All the data in the column will be lost.
  - You are about to drop the column `displayOrder` on the `foodcourt_categories` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `foodcourt_categories` table. All the data in the column will be lost.
  - You are about to drop the `menu_categories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `foodcourt_categories` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('MAKANAN_UTAMA', 'MINUMAN', 'CEMILAN', 'MAKANAN_MANIS');

-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_categoryId_fkey";

-- AlterTable
ALTER TABLE "foodcourt_categories" DROP COLUMN "description",
DROP COLUMN "displayOrder",
DROP COLUMN "name",
ADD COLUMN     "category" "CategoryType" NOT NULL;

-- DropTable
DROP TABLE "menu_categories";
