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
    message: "create appointment succssefully",
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
    message: "update the appointment succssefully",
    data: results,
  });
});

export const cancelAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const results = await cancelAppointmentService(req.params.id, currentUser);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `canceled appointment succssefully`,
    data: results,
  });
});

export const completeAppointment = asyncWrapper(async (req, res) => {
  const currentUser = req.user;
  const results = await completeAppointmentService(req.params.id, currentUser);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `completed appointment succssefully`,
    data: results,
  });
});

export const getDailySchedule = asyncWrapper(async (req, res) => {
  const { date, id } = req.body;

  const results = await getDailyScheduleService(id, date);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `Doctor has ${results.length} appointments at ${date}`,
    data: results,
  });
});

export const getDoctorSchedule = asyncWrapper(async (req, res) => {
  const { id } = req.body;
  const results = await getDoctorScheduleService(id);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `Doctor has ${results.length} appointments`,
    data: results,
  });
});
