/**
 * app.js
 * Express application setup.
 * Security middleware, routes, and error handling.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");

const errorHandler = require("./middleware/errorHandler");
const AppError = require("./utils/AppError");
const logger = require("./utils/logger");

// ── Route imports ─────────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const shopRoutes     = require("./routes/shopRoutes");
const productRoutes  = require("./routes/productRoutes");
const reviewRoutes   = require("./routes/reviewRoutes");
const trendingRoutes = require("./routes/trendingRoutes");
const billingRoutes  = require("./routes/billingRoutes");
const orderRoutes    = require("./routes/orderRoutes");

const app = express();

// ── Security Headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Billing-Api-Key"],
    credentials: true,
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: "Too many requests. Please slow down and try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many login attempts. Please wait 15 minutes." },
});

app.use("/api", globalLimiter);
app.use("/api/v1/auth/login",    authLimiter);
app.use("/api/v1/auth/register", authLimiter);

// ── Request Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));         // Body size limit for security
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Sanitization (prevent NoSQL injection attacks) ────────────────────────────
app.use(mongoSanitize());

// ── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ── HTTP Request Logger ───────────────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(
    morgan("combined", {
      stream: { write: (message) => logger.info(message.trim()) },
    })
  );
}

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FairCart API is running 🚀",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── API Routes ────────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`,     authRoutes);
app.use(`${API}/shops`,    shopRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/reviews`,  reviewRoutes);
app.use(`${API}/trending`, trendingRoutes);
app.use(`${API}/billing`,  billingRoutes);
app.use(`${API}/orders`,   orderRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.all("*", (req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// ── Global Error Handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;
