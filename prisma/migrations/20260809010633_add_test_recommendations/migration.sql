-- CreateTable
CREATE TABLE "test_recommendations" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "testName" TEXT NOT NULL,
    "notes" TEXT,
    "referringClinicId" TEXT,
    "targetClinicId" TEXT,
    "targetCenterName" TEXT,
    "createdByUserId" TEXT NOT NULL,
    "createdByRole" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_recommendations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_referringClinicId_fkey" FOREIGN KEY ("referringClinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_targetClinicId_fkey" FOREIGN KEY ("targetClinicId") REFERENCES "clinics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
