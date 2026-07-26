-- DropIndex
DROP INDEX "appointments_doctorId_date_token_key";
-- DropIndex
DROP INDEX "queues_doctorId_date_key";

-- AlterTable: add clinicId as NULLABLE first
ALTER TABLE "appointments" ADD COLUMN     "clinicId" TEXT;
ALTER TABLE "queues" ADD COLUMN     "clinicId" TEXT;

-- Backfill: set clinicId to each row's doctor's current primary clinic
UPDATE "appointments" a
SET "clinicId" = d."clinicId"
FROM "doctors" d
WHERE a."doctorId" = d.id;

UPDATE "queues" q
SET "clinicId" = d."clinicId"
FROM "doctors" d
WHERE q."doctorId" = d.id;

-- Now enforce NOT NULL now that every row has a value
ALTER TABLE "appointments" ALTER COLUMN "clinicId" SET NOT NULL;
ALTER TABLE "queues" ALTER COLUMN "clinicId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctorId_clinicId_date_token_key" ON "appointments"("doctorId", "clinicId", "date", "token");
-- CreateIndex
CREATE UNIQUE INDEX "queues_doctorId_clinicId_date_key" ON "queues"("doctorId", "clinicId", "date");
-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics"("id") ON DELETE CASCADE ON UPDATE CASCADE;