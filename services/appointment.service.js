import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import Appointment from "../models/appointment.model.js";
import { checkOverlap } from "../utils/checkOverlap.util.js";
import { validateAppointmentStatus } from "../utils/validateAppointmentStatus.util.js";
import { formatDate } from "../utils/formatDate.util.js";
import {
  APPOINTMENT_STATUS,
  DURATION,
} from "../constants/appointments.constants.js";
import mongoose from "mongoose";

// create appointment service
export const createAppointmentService = async (currentUser, data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // export data from body request
    const { patient_id, doctor_id, date, startTime } = data;

    // check patient is exists
    const patient = await Patient.exists({ _id: patient_id });
    if (!patient)
      throw new AppError(400, requestStatus.FAIL, "Patient not found");

    // check doctor is exists
    const doctor = await Doctor.exists({ _id: doctor_id });
    if (!doctor)
      throw new AppError(400, requestStatus.FAIL, "Doctor not found");

    // check time
    const appointmentDate = new Date(`${date}T${startTime}:00`);

    // check invalid time
    if (isNaN(appointmentDate.getTime())) {
      throw new AppError(400, requestStatus.FAIL, "Invalid appointment date");
    }
    const today = new Date();

    // prevent past booking
    if (appointmentDate <= today)
      throw new AppError(400, requestStatus.FAIL, "can't book on the past");

    // configere the end of the appointment
    const endDate = new Date(
      appointmentDate.getTime() + DURATION.SESSION * 60 * 1000
    );

    // check exsits appointment
    await checkOverlap(doctor_id, appointmentDate, endDate, null, session);

    // return the data to controller
    const [appointment] = await Appointment.create(
      [
        {
          patient_id,
          doctor_id,
          startDate: appointmentDate,
          endDate: endDate,
          created_by: currentUser.id,
          modified_by: currentUser.id,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    return appointment;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession;
  }
};

// update appointment service
export const updateAppointmentService = async (id, data, currentUser) => {
  // check the appointment is exists
  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new AppError(404, requestStatus.FAIL, "Appointment not found");
  }

  // check appointments status
  if (appointment.status !== APPOINTMENT_STATUS.SCHEDULED) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Only scheduled appointments can be updated"
    );
  }

  // current values
  const currentDate = formatDate(appointment.startDate);
  const currentTime = appointment.startDate.toTimeString().slice(0, 5);

  // updated values
  const date = data.date || currentDate;
  const startTime = data.startTime || currentTime;

  // build new appointment date
  const appointmentDate = new Date(`${date}T${startTime}:00`);

  // validate date
  if (isNaN(appointmentDate.getTime())) {
    throw new AppError(400, requestStatus.FAIL, "Invalid appointment date");
  }

  // prevent past booking
  if (appointmentDate <= new Date()) {
    throw new AppError(400, requestStatus.FAIL, "Cannot book in the past");
  }

  const endDate = new Date(
    appointmentDate.getTime() + DURATION.SESSION * 60 * 1000
  );

  // check overlap
  await checkOverlap(
    appointment.doctor_id,
    appointmentDate,
    endDate,
    appointment.id
  );

  // update fields
  appointment.startDate = appointmentDate;
  appointment.endDate = endDate;

  if (data.notes !== undefined) {
    appointment.notes = data.notes;
  }

  appointment.modified_by = currentUser.id;
  await appointment.save();
  return appointment;
};

// cancel appointment
export const cancelAppointmentService = async (id, currentUser) => {
  // check appointment exists
  const appointment = await Appointment.findById(id);

  // valdiate appointment
  validateAppointmentStatus(appointment, [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
  ]);

  // cancel appointment
  appointment.status = APPOINTMENT_STATUS.CANCELLED;

  // update the modified
  appointment.modified_by = currentUser.id;
  await appointment.save();
  return appointment;
};

// complete appointment
export const completeAppointmentService = async (id, currentUser) => {
  // check appointment is exists
  const appointment = await Appointment.findById(id);

  // valdiate appointment
  validateAppointmentStatus(appointment, [
    APPOINTMENT_STATUS.COMPLETED,
    APPOINTMENT_STATUS.CANCELLED,
  ]);

  // check time before take the action
  if (appointment.startDate > new Date()) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Cannot complete appointment before it starts"
    );
  }

  // complete the appointment
  appointment.status = APPOINTMENT_STATUS.COMPLETED;

  // update the modified
  appointment.modified_by = currentUser.id;
  await appointment.save();
  return appointment;
};

// daily schedule service
export const getDailyScheduleService = async (id, date, currentUser) => {
  // check doctor is exists
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError(404, requestStatus.FAIL, "doctor not found");

  // make sure the doctor can see his appointmens only
  if (
    currentUser.role === "doctor" &&
    doctor.user_id.toString() !== currentUser.id
  )
    throw new AppError(400, requestStatus.FAIL, "Unauthorized");

  // modify start of day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  // modify end of date
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  // check the time is invalid
  if (isNaN(startOfDay.getTime())) {
    throw new AppError(400, requestStatus.FAIL, "Invalid date");
  }

  const results = await Appointment.find({
    doctor_id: id,
    status: APPOINTMENT_STATUS.SCHEDULED,
    startDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .select("startDate endDate status notes")
    .sort({ startDate: 1 })
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

  return results;
};

// doctor schedule service
export const getDoctorScheduleService = async (
  id,
  page,
  limit,
  currentUser
) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError(404, requestStatus.FAIL, "doctor not found");

  if (
    currentUser.role === "doctor" &&
    doctor.user_id.toString() !== currentUser.id
  )
    throw new AppError(400, requestStatus.FAIL, "Unauthorized");

  const pageNumber = Number(page) || 1;
  const limitNumber = Number(limit) || 10;
  const skip = (pageNumber - 1) * limitNumber;

  const total = await Appointment.countDocuments({
    doctor_id: id,
  });

  const results = await Appointment.find({
    doctor_id: id,
  })
    .select("startDate endDate status notes")
    .sort({ startDate: 1 })
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
    .skip(skip)
    .limit(limitNumber)
    .lean();

  return {
    total,
    page: pageNumber,
    limit: limitNumber,
    pages: Math.ceil(total / limitNumber),
    appointments: results,
  };
};
