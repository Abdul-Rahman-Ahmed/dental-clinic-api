import {
  cancelAppointmentService,
  CompleteAppointmentService,
  createAppointmentService,
  getDailyScheduleService,
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
  const data = req.body;

  const results = await updateAppointmentService(id, data);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "update the appointment succssefully",
    data: results,
  });
});

export const cancelAppointment = asyncWrapper(async (req, res) => {
  const results = await cancelAppointmentService(req.params.id);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `canceled appointment succssefully`,
    data: results,
  });
});

export const completeAppointment = asyncWrapper(async (req, res) => {
  const results = await CompleteAppointmentService(req.params.id);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `completed appointment succssefully`,
    data: results,
  });
});

export const getDailySchedule = asyncWrapper(async (req, res) => {
  const { date } = req.body;
  const { id } = req.user;
  const results = await getDailyScheduleService(id, date);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: `Doctor daily schedule`,
    data: results,
  });
});
