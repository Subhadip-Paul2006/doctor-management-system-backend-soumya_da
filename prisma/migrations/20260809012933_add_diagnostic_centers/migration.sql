-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'DIAGNOSTIC_CENTER';
ALTER TYPE "Role" ADD VALUE 'DIAGNOSTIC_STAFF';

-- CreateTable
CREATE TABLE "diagnostic_centers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "centerName" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logo" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "diagnostic_center_staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diagnosticCenterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "diagnostic_center_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_referrals" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "testNames" TEXT[],
    "notes" TEXT,
    "referringClinicId" TEXT,
    "diagnosticCenterId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "createdByRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_centers_userId_key" ON "diagnostic_centers"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "diagnostic_center_staff_userId_key" ON "diagnostic_center_staff"("userId");

-- AddForeignKey
ALTER TABLE "diagnostic_centers" ADD CONSTRAINT "diagnostic_centers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_center_staff" ADD CONSTRAINT "diagnostic_center_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_center_staff" ADD CONSTRAINT "diagnostic_center_staff_diagnosticCenterId_fkey" FOREIGN KEY ("diagnosticCenterId") REFERENCES "diagnostic_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_referrals" ADD CONSTRAINT "test_referrals_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_referrals" ADD CONSTRAINT "test_referrals_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_referrals" ADD CONSTRAINT "test_referrals_referringClinicId_fkey" FOREIGN KEY ("referringClinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_referrals" ADD CONSTRAINT "test_referrals_diagnosticCenterId_fkey" FOREIGN KEY ("diagnosticCenterId") REFERENCES "diagnostic_centers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
