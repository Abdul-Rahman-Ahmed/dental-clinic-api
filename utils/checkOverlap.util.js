import Appointment from "../models/appointment.model.js";
import AppError from "./appError.util.js";
import requestStatus from "./requestStatus.util.js";
export const checkOverlap = async (doctor_id, appointmentDate, time) => {
  const appointment = await Appointment.exists({
    doctor_id,
    date: appointmentDate,
    "time.start": time.start,
  });

  if (appointment)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "this appointment already exsits",
      appointment
    );
};
