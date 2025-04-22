/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `foodcourts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "foodcourts_ownerId_key" ON "foodcourts"("ownerId");
