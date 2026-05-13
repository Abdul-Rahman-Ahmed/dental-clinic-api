import {
  cancelAppointmentService,
  completeAppointmentService,
  createAppointmentService,
  getDailyScheduleService,
  getDoctorScheduleService,
  updateAppointmentService,
} from "../services/appointment.service.js";
import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";

export const createAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const data = req.body;

  const results = await createAppointmentService(currentUser, data);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "create appointment successfully",
    data: results,
  });
});

export const updateAppointment = asyncWrapper(async (req, res) => {
  const id = req.params.id;
  const currentUser = req.user;
  const data = req.body;

  const results = await updateAppointmentService(id, data, currentUser);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "update the appointment successfully",
    data: results,
  });
});

export const cancelAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const results = await cancelAppointmentService(req.params.id, currentUser);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `canceled appointment successfully`,
    data: results,
  });
});

export const completeAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const results = await completeAppointmentService(req.params.id, currentUser);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `completed appointment successfully`,
    data: results,
  });
});

export const getDailySchedule = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;
  const currentUser = req.user;

  const results = await getDailyScheduleService(id, date, currentUser);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `Doctor has ${results.length} appointments at ${date}`,
    data: results,
  });
});

export const getDoctorSchedule = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { page, limit } = req.query;
  const currentUser = req.user;

  const results = await getDoctorScheduleService(id, page, limit, currentUser);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `Doctor appointments`,
    data: results,
  });
});
