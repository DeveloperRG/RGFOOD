-- DropForeignKey
ALTER TABLE "foodcourts" DROP CONSTRAINT "foodcourts_ownerId_fkey";

-- AlterTable
ALTER TABLE "foodcourts" ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "foodcourts" ADD CONSTRAINT "foodcourts_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
