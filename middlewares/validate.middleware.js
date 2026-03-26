import AppError from "../utils/appError.util.js";
import requestStatus from "../utils/requestStatus.util.js";

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return next(
        new AppError(
          400,
          requestStatus.FAIL,
          "Validation failed",
          formattedErrors
        )
      );
    }
    req[property] = result.data;
    next();
  };

export default validate;
