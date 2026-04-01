import asyncWrapper from "../middlewares/asyncWrapper.middleware.js";
import requestStatus from "../utils/requestStatus.util.js";
import {
  createDoctorService,
  getDoctorsService,
} from "../services/doctor.service.js";

export const createDoctor = asyncWrapper(async (req, res) => {
  const result = await createDoctorService(req.body, req.user);
  res.status(201).json({
    code: 201,
    status: requestStatus.SUCCESS,
    message: "Doctor added successfully",
    data: {
      doctor: {
        user_id: result.user._id,
        name: result.user.name,
        email: result.user.email,
        specialization: result.doctor.specialization,
        workingHours: result.doctor.workingHours,
      },
    },
  });
});

export const getDoctors = asyncWrapper(async (req, res) => {
  const doctors = await getDoctorsService();
  res.status(200).json({
    code: 200,
    status: requestStatus.SUCCESS,
    results: doctors.length,
    data: { doctors },
  });
});
