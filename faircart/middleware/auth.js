/**
 * middleware/auth.js
 * JWT authentication and role-based access control middleware.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");

/**
 * protect — verifies JWT token and attaches user to req.user
 * Place this middleware on any route that requires authentication.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization header: "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Also allow token from cookies (for web sessions)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError("You are not logged in. Please log in to access this resource.", 401));
  }

  // Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    if (err.name === "TokenExpiredError") {
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
    return next(new AppError("Authentication failed.", 401));
  }

  // Fetch user from DB to check if still active
  const user = await User.findById(decoded.id).select("+isActive");

  if (!user) {
    return next(new AppError("The user belonging to this token no longer exists.", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Please contact support.", 403));
  }

  // Attach user to request
  req.user = user;
  next();
});

/**
 * authorize(...roles) — restricts route access to specific roles
 * Usage: router.delete('/shop', protect, authorize('admin', 'shopOwner'), deleteShop)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this resource.`,
          403
        )
      );
    }
    next();
  };
};

/**
 * optionalAuth — attaches user if token present, but doesn't block if missing
 * Useful for public endpoints that behave differently for logged-in users.
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (_) {
      // Silent fail — continue without user
    }
  }

  next();
});

module.exports = { protect, authorize, optionalAuth };
