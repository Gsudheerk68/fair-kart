/**
 * utils/AppError.js
 * Custom error class for operational errors.
 * Allows throwing structured errors from anywhere in the app.
 *
 * Usage:
 *   throw new AppError('Shop not found', 404);
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Distinguishes from programming errors

    // Capture stack trace (excludes constructor call)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
