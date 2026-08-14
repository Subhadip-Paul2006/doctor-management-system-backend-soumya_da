import ApiError from "../../utils/apiError.js";
import { findClinicByUserId } from "../clinic/clinic.repository.js";
import {
  getAppointmentsForClinicOnDate,
  getAppointmentsForClinicInRange,
  getEarliestVisitDatePerPatient,
  getQueuesForClinicOnDate,
} from "./analytics.repository.js";
import { getBucketLabel, getPreviousEquivalentRange, calculateGrowthRate } from "./analytics.helper.js";

const todayDateString = () => new Date().toISOString().split("T")[0];

export const getDailyDashboard = async (clinicUserId, dateInput) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const date = dateInput || todayDateString();

  const [appointments, earliestVisitMap, queues] = await Promise.all([
    getAppointmentsForClinicOnDate(clinic.id, date),
    getEarliestVisitDatePerPatient(clinic.id),
    getQueuesForClinicOnDate(clinic.id, date),
  ]);

  const distinctPatientIds = new Set(appointments.map((a) => a.patientId));

  let newPatients = 0;
  let returningPatients = 0;
  distinctPatientIds.forEach((patientId) => {
    if (earliestVisitMap.get(patientId) === date) {
      newPatients += 1;
    } else {
      returningPatients += 1;
    }
  });

  const statusBreakdown = { WAITING: 0, CHECKED_IN: 0, ABSENT: 0, COMPLETED: 0, CANCELLED: 0 };
  const doctorWise = {};

  appointments.forEach((appt) => {
    statusBreakdown[appt.status] = (statusBreakdown[appt.status] || 0) + 1;

    const doctorName = appt.doctor.user.name;
    if (!doctorWise[doctorName]) {
      doctorWise[doctorName] = { totalAppointments: 0, completed: 0, waiting: 0 };
    }
    doctorWise[doctorName].totalAppointments += 1;
    if (appt.status === "COMPLETED") doctorWise[doctorName].completed += 1;
    if (appt.status === "WAITING" || appt.status === "CHECKED_IN") doctorWise[doctorName].waiting += 1;
  });

  const queueSummary = queues.map((q) => ({
    doctorName: q.doctor.user.name,
    currentToken: q.currentToken,
    lastTokenIssued: q.lastTokenIssued,
    status: q.status,
  }));

  return {
    clinicName: clinic.clinicName,
    date,
    totalPatients: distinctPatientIds.size,
    totalAppointments: appointments.length,
    newPatients,
    returningPatients,
    statusBreakdown,
    doctorWise,
    queueSummary,
  };
};

export const getGrowthAnalytics = async (clinicUserId, { granularity, startDate, endDate }) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");

  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const [appointments, earliestVisitMap] = await Promise.all([
    getAppointmentsForClinicInRange(clinic.id, start, end),
    getEarliestVisitDatePerPatient(clinic.id),
  ]);

  // Bucket appointments by period, classifying each patient visit as new/returning
  const buckets = {};

  appointments.forEach((appt) => {
    const label = getBucketLabel(appt.date, granularity);
    if (!buckets[label]) {
      buckets[label] = { newPatients: new Set(), returningPatients: new Set(), totalAppointments: 0, doctorWise: {} };
    }

    buckets[label].totalAppointments += 1;

    const apptDateStr = appt.date.toISOString().split("T")[0];
    const isNew = earliestVisitMap.get(appt.patientId) === apptDateStr;
    if (isNew) {
      buckets[label].newPatients.add(appt.patientId);
    } else {
      buckets[label].returningPatients.add(appt.patientId);
    }

    const doctorName = appt.doctor.user.name;
    buckets[label].doctorWise[doctorName] = (buckets[label].doctorWise[doctorName] || 0) + 1;
  });

  const trend = Object.entries(buckets)
    .map(([label, data]) => ({
      period: label,
      newPatients: data.newPatients.size,
      returningPatients: data.returningPatients.size,
      totalPatients: data.newPatients.size + data.returningPatients.size,
      totalAppointments: data.totalAppointments,
      doctorWise: data.doctorWise,
    }))
    .sort((a, b) => (a.period > b.period ? 1 : -1));

  // Growth rate: total distinct patients this period vs the immediately preceding equal-length period
  const { prevStart, prevEnd } = getPreviousEquivalentRange(start, end);
  const prevAppointments = await getAppointmentsForClinicInRange(clinic.id, prevStart, prevEnd);

  const currentDistinctPatients = new Set(appointments.map((a) => a.patientId)).size;
  const previousDistinctPatients = new Set(prevAppointments.map((a) => a.patientId)).size;

  const growthRatePercent = calculateGrowthRate(currentDistinctPatients, previousDistinctPatients);

  return {
    clinicName: clinic.clinicName,
    granularity,
    startDate,
    endDate,
    trend,
    summary: {
      currentPeriodPatients: currentDistinctPatients,
      previousPeriodPatients: previousDistinctPatients,
      growthRatePercent,
    },
  };
};