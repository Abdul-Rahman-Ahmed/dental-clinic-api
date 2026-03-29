import { createAppointmentService } from "../services/appointment.service.js";
import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";

export const createAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const data = req.body;

  const results = await createAppointmentService(currentUser, data);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    data: results,
  });
});
