/**
 * server.js
 * Application entry point.
 * Loads env variables, connects to DB, starts HTTP server.
 */

// Load environment variables FIRST before anything else
require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

// ── Connect to MongoDB, then start server ─────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      logger.info(`
╔═══════════════════════════════════════════╗
║        🛒  FairCart API  🛒               ║
║                                           ║
║  Environment : ${(process.env.NODE_ENV || "development").padEnd(26)}║
║  Port        : ${String(PORT).padEnd(26)}║
║  API Base    : http://localhost:${PORT}/api/v1  ║
╚═══════════════════════════════════════════╝
      `);
    });

    // ── Graceful Shutdown ──────────────────────────────────────────────────────
    const shutdown = (signal) => {
      logger.info(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("✅ HTTP server closed.");
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        logger.error("⏱️ Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

    // ── Unhandled Promise Rejections ───────────────────────────────────────────
    process.on("unhandledRejection", (err) => {
      logger.error(`💥 Unhandled Rejection: ${err.message}`);
      logger.error(err.stack);
      shutdown("UNHANDLED_REJECTION");
    });

    // ── Uncaught Exceptions ────────────────────────────────────────────────────
    process.on("uncaughtException", (err) => {
      logger.error(`💥 Uncaught Exception: ${err.message}`);
      logger.error(err.stack);
      process.exit(1);
    });

  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();
