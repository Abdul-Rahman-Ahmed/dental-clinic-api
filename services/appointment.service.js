import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import Appointment from "../models/appointment.model.js";
import { checkOverlap } from "../utils/checkOverlap.util.js";

export const createAppointmentService = async (currentUser, data) => {
  const { patient_id, doctor_id, date, time, notes = "" } = data;

  const patient = await Patient.exists({ _id: patient_id });
  if (!patient)
    throw new AppError(400, requestStatus.FAIL, "patient not found");

  const doctor = await Doctor.exists({ _id: doctor_id });
  if (!doctor) throw new AppError(400, requestStatus.FAIL, "doctor not found");

  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);
  await checkOverlap(doctor_id, appointmentDate, time);

  if (new Date(date) < new Date())
    throw new AppError(400, requestStatus.FAIL, "Cannot book in the past");

  return await Appointment.create({
    patient_id,
    doctor_id,
    date: appointmentDate,
    time,
    notes,
    created_by: currentUser.id,
    modified_by: currentUser.id,
  });
};

export const updateAppointmentService = async (id, data) => {
  const appointment = await Appointment.findById(id);
  if (!appointment) throw new AppError(400, requestStatus.FAIL, "Not found");

  if (data.time || data.date) {
    if (new Date(data.date || appointment.date) < new Date())
      throw new AppError(400, requestStatus.FAIL, "Cannot book in the past");

    const appointmentDate = new Date(data.date || appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);

    await checkOverlap(appointment.doctor, appointmentDate, data.time);
  }

  Object.assign(appointment, data);
  await appointment.save();
  return appointment;
};

export const cancelAppointmentService = async (id) => {
  const appointment = await Appointment.findById(id);

  if (!appointment)
    throw new AppError(400, requestStatus.FAIL, "appointment not found");

  if (appointment.status === "cancelled")
    throw new AppError(400, "Already cancelled");

  appointment.status = "canceled";
  await appointment.save();
  return appointment;
};

export const CompleteAppointmentService = async (id) => {
  const appointment = await Appointment.findById(id);

  if (!appointment)
    throw new AppError(400, requestStatus.FAIL, "appointment not found");

  if (appointment.status === "completed")
    throw new AppError(400, "Already completed");

  appointment.status = "completed";
  await appointment.save();
  return appointment;
};

export const getDailyScheduleService = async (doctorId, date) => {
  const results = await Appointment.find({
    doctor: doctorId,
    date,
    status: "scheduled",
  });

  if (!results) throw new AppError(400, requestStatus.FAIL, "Doctor not found");
  return results;
};

export const getDoctorScheduleService = async (doctorId) => {
  return await Appointment.find({
    doctor: doctorId,
  }).sort({ date: 1, startTime: 1 });
};
