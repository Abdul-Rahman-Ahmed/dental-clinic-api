import AppError from "./appError.util.js";
import requestStatus from "./requestStatus.util.js";

export const validateAppointmentStatus = (
  appointment,
  invalidStatuses = []
) => {
  if (!appointment) {
    throw new AppError(404, requestStatus.FAIL, "Appointment not found");
  }

  if (invalidStatuses.includes(appointment.status)) {
    throw new AppError(
      400,
      requestStatus.FAIL,
      `Cannot perform this action on ${appointment.status} appointment`
    );
  }
};
