/**
 * utils/logger.js
 * Winston-based production logger.
 * Logs to console (dev) and files (production).
 */

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf, colorize, errors } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // Capture stack traces
    logFormat
  ),
  transports: [
    // Console output (colorized in dev)
    new transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), logFormat),
    }),

    // Write errors to error.log
    new transports.File({ filename: "logs/error.log", level: "error" }),

    // Write all logs to combined.log
    new transports.File({ filename: "logs/combined.log" }),
  ],

  // Don't crash on uncaught exceptions
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
});

module.exports = logger;
