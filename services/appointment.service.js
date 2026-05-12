import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import Appointment from "../models/appointment.model.js";
import { checkOverlap } from "../utils/checkOverlap.util.js";
import { validateAppointmentStatus } from "../utils/validateAppointmentStatus.util.js";
import { formatDate } from "../utils/formatDate.util.js";

export const createAppointmentService = async (currentUser, data) => {
  const { patient_id, doctor_id, date, startTime } = data;

  // check patient
  const patient = await Patient.exists({ _id: patient_id });
  if (!patient)
    throw new AppError(400, requestStatus.FAIL, "Patient not found");

  // check doctor
  const doctor = await Doctor.exists({ _id: doctor_id });
  if (!doctor) throw new AppError(400, requestStatus.FAIL, "Doctor not found");

  //check time
  const appointmentDate = new Date(`${date}T${startTime}:00`);

  if (isNaN(appointmentDate.getTime())) {
    throw new AppError(400, requestStatus.FAIL, "Invalid appointment date");
  }
  const today = new Date();

  if (appointmentDate <= today)
    throw new AppError(400, requestStatus.FAIL, "can't book on the past");

  const endDate = new Date(appointmentDate.getTime() + 90 * 60 * 1000);

  // check exsits appointment
  await checkOverlap(doctor_id, appointmentDate, endDate);

  return await Appointment.create({
    patient_id,
    doctor_id,
    startDate: appointmentDate,
    endDate: endDate,
    created_by: currentUser.id,
    modified_by: currentUser.id,
  });
};

export const updateAppointmentService = async (id, data, currentUser) => {
  const appointment = await Appointment.findById(id);

  if (!appointment) {
    throw new AppError(404, requestStatus.FAIL, "Appointment not found");
  }

  if (appointment.status !== "scheduled") {
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

  // duration = 90 min
  const endDate = new Date(appointmentDate.getTime() + 90 * 60 * 1000);

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

export const cancelAppointmentService = async (id, currentUser) => {
  const appointment = await Appointment.findById(id);

  validateAppointmentStatus(appointment, ["completed", "cancelled"]);

  appointment.status = "cancelled";

  appointment.modified_by = currentUser.id;
  await appointment.save();
  return appointment;
};

export const completeAppointmentService = async (id, currentUser) => {
  const appointment = await Appointment.findById(id);

  validateAppointmentStatus(appointment, ["completed", "cancelled"]);

  if (appointment.startDate > new Date()) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Cannot complete appointment before it starts"
    );
  }

  appointment.status = "completed";

  appointment.modified_by = currentUser.id;
  await appointment.save();
  return appointment;
};

/* getDailyScheduleService */
export const getDailyScheduleService = async (id, date) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError(404, requestStatus.FAIL, "doctor not found");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  if (isNaN(startOfDay.getTime())) {
    throw new AppError(400, requestStatus.FAIL, "Invalid date");
  }

  const results = await Appointment.find({
    doctor_id: id,
    startDate: {
      $gte: startOfDay,
      $lte: endOfDay,
    },
  })
    .sort({ startDate: 1 })
    .lean();

  return results;
};

/* getDoctorScheduleService */
export const getDoctorScheduleService = async (id) => {
  const doctor = await Doctor.findById(id);
  if (!doctor) throw new AppError(404, requestStatus.FAIL, "doctor not found");

  const results = await Appointment.find({
    doctor_id: id,
  })
    .sort({ startDate: 1 })
    .lean();

  return results;
};
