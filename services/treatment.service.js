import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import Appointment from "../models/appointment.model.js";
import Treatment from "../models/treatment.model.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import checkInvalidID from "../utils/checkInvalidID.util.js";
import { TREATMENT_STATUS } from "../constants/treatment.constants.js";

export const createTreatmentService = async (
  {
    patient_id,
    doctor_id,
    appointment_id,
    title,
    diagnoses,
    procedure_notes = null,
    tooth_number,
    treated_at,
  },
  currentUser
) => {
  // check if patient is valid and exists
  checkInvalidID(patient_id, "patient");
  const patient = await Patient.findById(patient_id);
  if (!patient)
    throw new AppError(400, requestStatus.FAIL, "Patient not found");

  // check if doctor is valid and exists
  checkInvalidID(doctor_id, "doctor");
  const doctor = await Doctor.findById(doctor_id);
  if (!doctor) throw new AppError(400, requestStatus.FAIL, "Doctor not found");
  if (
    currentUser.role === "doctor" &&
    doctor.user_id.toString() !== currentUser.id
  )
    throw new AppError(403, requestStatus.FAIL, "Unauthorized");

  // check if appointment is valid and exists
  checkInvalidID(appointment_id, "appointment");
  const appointment = await Appointment.findById(appointment_id);
  if (!appointment)
    throw new AppError(400, requestStatus.FAIL, "Appointment not found");

  if (appointment.patient_id.toString() !== patient_id)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Appointment does not belong to the patient"
    );

  if (appointment.doctor_id.toString() !== doctor_id)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Appointment does not belong to the doctor"
    );

  const treatment = new Treatment({
    patient_id,
    doctor_id,
    appointment_id,
    title,
    diagnoses,
    procedure_notes,
    tooth_number,
    treated_at,
    created_by: currentUser.id,
    modified_by: currentUser.id,
  });

  return await treatment.save();
};

export const getTreatmentsService = async (page, limit) => {
  const skip = (page - 1) * limit;
  const treatments = await Treatment.find()
    .select(
      "title diagnoses procedure_notes tooth_number treated_at modified_by"
    )
    .populate({
      path: "patient_id",
      select: "medical_notes",
      populate: {
        path: "user_id",
        select: "name phone",
      },
    })
    .populate({
      path: "doctor_id",
      select: "specialization",
      populate: {
        path: "user_id",
        select: "name phone",
      },
    })
    .populate("modified_by", "name")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  const total = await Treatment.countDocuments();

  return { treatments, total };
};

export const getTreatmentByIdService = async (id) => {
  checkInvalidID(id, "treatment");
  const treatment = await Treatment.findById(id)
    .select(
      "title diagnoses procedure_notes tooth_number treated_at modified_by"
    )
    .populate({
      path: "patient_id",
      select: "medical_notes",
      populate: {
        path: "user_id",
        select: "name phone",
      },
    })
    .populate({
      path: "doctor_id",
      select: "specialization",
      populate: {
        path: "user_id",
        select: "name phone",
      },
    })
    .lean();

  if (!treatment)
    throw new AppError(404, requestStatus.FAIL, "Treatment not found");

  return treatment;
};

export const updateTreatmentService = async (
  id,
  { title, diagnoses, procedure_notes, tooth_number, treated_at },
  currentUser
) => {
  checkInvalidID(id, "treatment");
  const treatment = await Treatment.findById(id).populate({
    path: "doctor_id",
    select: "user_id",
    populate: {
      path: "user_id",
      select: "name phone",
    },
  });
  if (!treatment)
    throw new AppError(404, requestStatus.FAIL, "Treatment not found");
  if (
    currentUser.role === "doctor" &&
    treatment.doctor_id.user_id.id.toString() !== currentUser.id
  )
    throw new AppError(403, requestStatus.FAIL, "Unauthorized");

  if (
    treatment.status === TREATMENT_STATUS.COMPLETED ||
    treatment.status === TREATMENT_STATUS.CANCELLED
  ) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Cannot update completed or cancelled treatment"
    );
  }

  if (
    (treatment.title === title || title === undefined) &&
    (treatment.diagnoses === diagnoses || diagnoses === undefined) &&
    (treatment.procedure_notes === procedure_notes ||
      procedure_notes === undefined) &&
    (treatment.tooth_number === tooth_number || tooth_number === undefined) &&
    (treatment.treated_at.getTime() === new Date(treated_at).getTime() ||
      treated_at === undefined)
  )
    throw new AppError(400, requestStatus.FAIL, "No changes detected");

  if (title !== undefined) treatment.title = title;
  if (diagnoses !== undefined) treatment.diagnoses = diagnoses;
  if (procedure_notes !== undefined)
    treatment.procedure_notes = procedure_notes;
  if (tooth_number !== undefined) treatment.tooth_number = tooth_number;
  if (treated_at !== undefined) treatment.treated_at = treated_at;
  treatment.modified_by = currentUser.id;

  return await treatment.save();
};

export const updateTreatmentStatusService = async (id, status, currentUser) => {
  checkInvalidID(id, "treatment");
  const treatment = await Treatment.findById(id).populate({
    path: "doctor_id",
    populate: {
      path: "user_id",
      select: "name phone",
    },
  });

  if (!treatment)
    throw new AppError(404, requestStatus.FAIL, "Treatment not found");

  if (
    currentUser.role === "doctor" &&
    treatment.doctor_id.user_id.id !== currentUser.id
  )
    throw new AppError(403, requestStatus.FAIL, "Unauthorized");

  if (treatment.status === status)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Treatment already has the same status"
    );

  if (
    treatment.status === TREATMENT_STATUS.COMPLETED ||
    treatment.status === TREATMENT_STATUS.CANCELLED
  ) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Cannot change status of completed or cancelled treatment"
    );
  }

  treatment.status = status;
  treatment.modified_by = currentUser.id;

  return await treatment.save();
};
