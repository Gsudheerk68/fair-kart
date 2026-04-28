/**
 * middleware/errorHandler.js
 * Global error handling middleware.
 * Catches all errors thrown via next(error) and formats them consistently.
 */

const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

// ───── Handle Mongoose CastError (invalid ObjectId) ─────
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// ───── Handle Mongoose duplicate key error ─────
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `A record with ${field} "${value}" already exists. Please use a different value.`;
  return new AppError(message, 409);
};

// ───── Handle Mongoose validation errors ─────
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
  }));
  return new AppError("Validation failed. Please check your input.", 400, errors);
};

// ───── Handle JWT errors ─────
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = () =>
  new AppError("Your session has expired. Please log in again.", 401);

// ───── Send detailed errors in development ─────
const sendDevError = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};

// ───── Send clean errors in production ─────
const sendProdError = (err, res) => {
  // Operational errors: safe to send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.validationErrors && { errors: err.validationErrors }),
    });
  } else {
    // Programming/unknown errors: hide details from client
    logger.error("💥 UNEXPECTED ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ───── Main error handler ─────
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    logger.error(`[${req.method}] ${req.originalUrl} — ${err.message}`);
    sendDevError(err, res);
  } else {
    // Map known Mongoose/JWT errors to friendly AppErrors
    let error = { ...err, message: err.message };

    if (err.name === "CastError") error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === "ValidationError") error = handleValidationError(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendProdError(error, res);
  }
};

module.exports = errorHandler;
