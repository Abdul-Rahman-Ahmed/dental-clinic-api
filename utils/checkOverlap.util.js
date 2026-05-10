import Appointment from "../models/appointment.model.js";
import AppError from "./appError.util.js";
import requestStatus from "./requestStatus.util.js";

export const checkOverlap = async (
  doctor_id,
  startDate,
  endDate,
  appointmentId = null
) => {
  const conflict = await Appointment.findOne({
    doctor_id,
    startDate: { $lt: endDate },
    endDate: { $gt: startDate },
    _id: { $ne: appointmentId },
  });

  if (conflict)
    throw new AppError(
      400,
      requestStatus.FAIL,
      "Doctor already has an appointment during this time",
      conflict
    );
};
