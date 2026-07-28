-- DropIndex
DROP INDEX "receptionist_doctors_receptionistId_doctorId_key";

-- AlterTable: add clinicId as NULLABLE first
ALTER TABLE "receptionist_doctors" ADD COLUMN     "clinicId" TEXT;

-- Backfill: set clinicId to each row's doctor's current primary clinic
UPDATE "receptionist_doctors" rd
SET "clinicId" = d."clinicId"
FROM "doctors" d
WHERE rd."doctorId" = d.id;

-- Now enforce NOT NULL now that every row has a value
ALTER TABLE "receptionist_doctors" ALTER COLUMN "clinicId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "receptionist_doctors_receptionistId_doctorId_clinicId_key" ON "receptionist_doctors"("receptionistId", "doctorId", "clinicId");
-- AddForeignKey
ALTER TABLE "receptionist_doctors" ADD CONSTRAINT "receptionist_doctors_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;