import {
  createTreatmentService,
  getTreatmentsService,
  getTreatmentByIdService,
  updateTreatmentService,
  updateTreatmentStatusService,
} from "../services/treatment.service.js";
import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";

export const createTreatment = asyncWrapper(async (req, res) => {
  const data = req.body;
  const currentUser = req.user;

  const results = await createTreatmentService(data, currentUser);

  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Treatment created successfully",
    data: results,
  });
});

export const getTreatment = asyncWrapper(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { total, treatments } = await getTreatmentsService(page, limit);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Get treatment",
    data: {
      total,
      pages: Math.ceil(total / limit),
      page: Number(page),
      limit: Number(limit),
      treatments,
    },
  });
});

export const getTreatmentById = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const treatment = await getTreatmentByIdService(id);

  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Get treatment by ID",
    data: treatment,
  });
});

export const updateTreatment = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  const currentUser = req.user;

  const updateTreatment = await updateTreatmentService(id, data, currentUser);
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Treatment updated successfully",
    data: updateTreatment,
  });
});

export const updateTreatmentStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const currentUser = req.user;

  const updatedTreatment = await updateTreatmentStatusService(
    id,
    status,
    currentUser
  );
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    message: "Treatment status updated successfully",
    data: updatedTreatment,
  });
});
