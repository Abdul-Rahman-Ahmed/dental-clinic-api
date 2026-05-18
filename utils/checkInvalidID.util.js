import mongoose from "mongoose";
import AppError from "./appError.util.js";
import requestStatus from "./requestStatus.util.js";

const checkInvalidID = (id, type) => {
  const validId = mongoose.Types.ObjectId.isValid(id);
  if (!validId)
    throw new AppError(400, requestStatus.FAIL, `Invalid ${type} ID`);
};

export default checkInvalidID;
