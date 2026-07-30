import { ZodError } from "zod";
import multer from "multer";
import logger from "../config/logger.config.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  if (err instanceof ZodError) {
    // Validation errors are the client's fault — always 400, never the generic 500.
    statusCode = 400;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
  } else if (err instanceof multer.MulterError) {
    // File upload issues (wrong field name, too many files, etc.) are also client errors.
    statusCode = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
  }

  logger.error({ err }, message);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorMiddleware;