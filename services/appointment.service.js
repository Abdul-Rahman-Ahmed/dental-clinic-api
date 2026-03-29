import Patient from "../models/patient.model.js";
import Doctor from "../models/doctor.model.js";
import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";
import Appointment from "../models/appointment.model.js";

export const createAppointmentService = async (currentUser, data) => {
  const { patient_id, doctor_id, date, time, notes = "" } = data;

  const patient = await Patient.exists({ _id: patient_id });
  if (!patient)
    throw new AppError(400, requestStatus.FAIL, "patient not found");

  const doctor = await Doctor.exists({ _id: doctor_id });
  if (!doctor) throw new AppError(400, requestStatus.FAIL, "doctor not found");
  const appointment = await Appointment.exists({
    doctor_id,
    date: new Date(date),
    "time.start": time.start,
  });
  if (appointment)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "this appointment already exsits",
      appointment
    );

  const appointmentDate = new Date(date);
  appointmentDate.setHours(0, 0, 0, 0);

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
