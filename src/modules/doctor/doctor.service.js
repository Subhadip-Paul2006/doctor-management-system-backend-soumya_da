import ApiError from "../../utils/apiError.js";
import prisma from "../../config/db.config.js";
import { Prisma } from "@prisma/client";
import { findClinicByUserId, findClinicById } from "../clinic/clinic.repository.js";
import {
  searchDoctorsByName,
  findDoctorByIdWithUser,
  findDoctorByUserId,
  findApprovedAssociationsForDoctor,
  createAssociationRequest,
  findAssociationById,
  updateAssociationStatus,
  findRequestsForDoctor,
  findRequestsForClinic,
} from "./doctor.repository.js";
import { findConflict } from "./schedule.helper.js";
import { uploadBufferToCloudinary } from "../../utils/cloudinaryUpload.js";
import { updateDoctorProfilePhoto } from "./doctor.repository.js";

export const searchByName = async (name) => {
  return searchDoctorsByName(name);
};

// Clinic sends a request to a doctor
export const sendRequestToDoctor = async (clinicUserId, payload) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  if (!clinic.isApproved) throw new ApiError(403, "Your clinic is not yet approved by admin");

  const doctor = await findDoctorByIdWithUser(payload.doctorId);
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const existingApproved = await findApprovedAssociationsForDoctor(doctor.id);
  const conflict = findConflict(payload, existingApproved);

  const association = await createAssociationRequest({
    doctorId: doctor.id,
    clinicId: clinic.id,
    fee: payload.fee,
    dayOfWeek: payload.dayOfWeek,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: "PENDING",
    requestedBy: "CLINIC",
  });

  return {
    association,
    conflictWarning: conflict
      ? "Note: this time slot currently conflicts with an approved schedule at another clinic. It will stay PENDING until that conflict is resolved."
      : null,
  };
};

// Doctor responds to a clinic's request
export const respondToClinicRequest = async (doctorUserId, associationId, action) => {
  const association = await findAssociationById(associationId);
  if (!association) throw new ApiError(404, "Request not found");

  const doctor = await findDoctorByUserId(doctorUserId);
  if (!doctor || doctor.id !== association.doctorId) {
    throw new ApiError(403, "This request does not belong to you");
  }

  if (association.status !== "PENDING") {
    throw new ApiError(400, `This request has already been ${association.status.toLowerCase()}`);
  }

  if (action === "REJECT") {
    return updateAssociationStatus(associationId, "REJECTED");
  }

  return approveAssociationSafely(associationId, association.doctorId);
};

export const getMyReceivedRequests = async (doctorUserId) => {
  const doctor = await findDoctorByUserId(doctorUserId);
  if (!doctor) throw new ApiError(404, "Doctor profile not found");
  return findRequestsForDoctor(doctor.id);
};

export const getMySentRequests = async (clinicUserId) => {
  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic) throw new ApiError(404, "Clinic profile not found");
  return findRequestsForClinic(clinic.id);
};


// Doctor sends a request to a clinic (mirror of sendRequestToDoctor)
export const sendRequestToClinic = async (doctorUserId, payload) => {
  const doctor = await findDoctorByUserId(doctorUserId);
  if (!doctor) throw new ApiError(404, "Doctor profile not found");
  if (!doctor.isVerified) throw new ApiError(403, "Your profile is not yet verified by admin");

  const clinic = await findClinicById(payload.clinicId);
  if (!clinic) throw new ApiError(404, "Clinic not found");
  if (!clinic.isApproved) throw new ApiError(400, "This clinic is not yet approved");

  const existingApproved = await findApprovedAssociationsForDoctor(doctor.id);
  const conflict = findConflict(payload, existingApproved);

  const association = await createAssociationRequest({
    doctorId: doctor.id,
    clinicId: clinic.id,
    fee: payload.fee,
    dayOfWeek: payload.dayOfWeek,
    startTime: payload.startTime,
    endTime: payload.endTime,
    status: "PENDING",
    requestedBy: "DOCTOR",
  });

  return {
    association,
    conflictWarning: conflict
      ? "Note: this time slot currently conflicts with an approved schedule at another clinic. It will stay PENDING until that conflict is resolved."
      : null,
  };
};

// Clinic responds to a doctor's request (mirror of respondToClinicRequest)
export const respondToDoctorRequest = async (clinicUserId, associationId, action) => {
  const association = await findAssociationById(associationId);
  if (!association) throw new ApiError(404, "Request not found");

  const clinic = await findClinicByUserId(clinicUserId);
  if (!clinic || clinic.id !== association.clinicId) {
    throw new ApiError(403, "This request does not belong to your clinic");
  }

  if (association.status !== "PENDING") {
    throw new ApiError(400, `This request has already been ${association.status.toLowerCase()}`);
  }

  if (action === "REJECT") {
    return updateAssociationStatus(associationId, "REJECTED");
  }

  return approveAssociationSafely(associationId, association.doctorId);
};

// Approves an association only if it's still PENDING and still conflict-free,
// checked and written inside a single Serializable transaction. Postgres will
// abort one side with a serialization failure (surfaced by Prisma as P2034)
// if two concurrent approvals for the same doctor would otherwise both pass
// the conflict check and create overlapping approved schedules.
const approveAssociationSafely = async (associationId, doctorId) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const current = await tx.doctorClinicAssociation.findUnique({ where: { id: associationId } });
        if (!current || current.status !== "PENDING") {
          throw new ApiError(
            400,
            `This request has already been ${current ? current.status.toLowerCase() : "removed"}`
          );
        }

        const existingApproved = await tx.doctorClinicAssociation.findMany({
          where: { doctorId, status: "APPROVED" },
        });

        const conflict = findConflict(current, existingApproved);
        if (conflict) {
          throw new ApiError(
            409,
            `Cannot approve — this overlaps with an already-approved schedule (${conflict.dayOfWeek} ${conflict.startTime}-${conflict.endTime}) at another clinic`
          );
        }

        return tx.doctorClinicAssociation.update({ where: { id: associationId }, data: { status: "APPROVED" } });
      },
      { isolation: Prisma.TransactionIsolationLevel.Serializable }
    );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err.code === "P2034") {
      throw new ApiError(409, "This approval conflicted with another concurrent request — please try again");
    }
    throw err;
  }
};

// Either the doctor or the clinic in this association can cancel an APPROVED (or PENDING) one.
// Cancelling an APPROVED association frees up that time slot for a conflicting PENDING request.
export const cancelAssociation = async (userId, userRole, associationId) => {
  const association = await findAssociationById(associationId);
  if (!association) throw new ApiError(404, "Association not found");

  if (userRole === "DOCTOR") {
    const doctor = await findDoctorByUserId(userId);
    if (!doctor || doctor.id !== association.doctorId) {
      throw new ApiError(403, "This association does not belong to you");
    }
  } else if (userRole === "CLINIC") {
    const clinic = await findClinicByUserId(userId);
    if (!clinic || clinic.id !== association.clinicId) {
      throw new ApiError(403, "This association does not belong to your clinic");
    }
  }

  if (association.status === "CANCELLED" || association.status === "REJECTED") {
    throw new ApiError(400, `This association is already ${association.status.toLowerCase()}`);
  }

  return updateAssociationStatus(associationId, "CANCELLED");
};

// merge updateDoctorProfilePhoto into your existing repository import line

export const uploadProfilePhoto = async (doctorUserId, fileBuffer) => {
  const doctor = await findDoctorByUserId(doctorUserId);
  if (!doctor) throw new ApiError(404, "Doctor profile not found");

  const result = await uploadBufferToCloudinary(fileBuffer, "jeet/doctors");
  return updateDoctorProfilePhoto(doctor.id, result.secure_url);
};