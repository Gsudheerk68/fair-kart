/**
 * controllers/authController.js
 * Handles user & shop owner registration, login, profile, logout.
 */

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { sendSuccess, sendError } = require("../utils/apiResponse");

// ───── Helper: Sign JWT ─────
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// ───── Helper: Create and send token response ─────
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = signToken(user._id);

  // Remove password from output
  user.password = undefined;

  return sendSuccess(res, statusCode, message, { token, user });
};

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/register
// @access  Public
// ─────────────────────────────────────────────
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  // Only allow "user" or "shopOwner" roles at registration
  const allowedRoles = ["user", "shopOwner"];
  const userRole = allowedRoles.includes(role) ? role : "user";

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("An account with this email already exists.", 409));
  }

  const user = await User.create({ name, email, password, phone, role: userRole });

  sendTokenResponse(user, 201, res, "Account created successfully. Welcome to FairCart!");
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/login
// @access  Public
// ─────────────────────────────────────────────
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password.", 400));
  }

  // Explicitly select password (it's select:false in schema)
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }

  if (!user.isActive) {
    return next(new AppError("Your account has been deactivated. Contact support.", 403));
  }

  // Update last login timestamp
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, "Login successful. Welcome back!");
});

// ─────────────────────────────────────────────
// @route   GET /api/v1/auth/me
// @access  Private
// ─────────────────────────────────────────────
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favouriteShops", "name address averageRating");
  sendSuccess(res, 200, "Profile fetched successfully.", user);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/auth/update-profile
// @access  Private
// ─────────────────────────────────────────────
exports.updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ["name", "phone", "avatar"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  sendSuccess(res, 200, "Profile updated successfully.", user);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/auth/update-location
// @access  Private
// ─────────────────────────────────────────────
exports.updateLocation = asyncHandler(async (req, res, next) => {
  const { longitude, latitude, address, city, pincode } = req.body;

  if (!longitude || !latitude) {
    return next(new AppError("Longitude and latitude are required.", 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        address: address || "",
        city: city || "",
        pincode: pincode || "",
      },
    },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, "Location updated successfully.", user.location);
});

// ─────────────────────────────────────────────
// @route   PUT /api/v1/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.matchPassword(currentPassword))) {
    return next(new AppError("Current password is incorrect.", 401));
  }

  if (newPassword.length < 6) {
    return next(new AppError("New password must be at least 6 characters.", 400));
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, "Password changed successfully.");
});

// ─────────────────────────────────────────────
// @route   POST /api/v1/auth/logout
// @access  Private
// ─────────────────────────────────────────────
exports.logout = asyncHandler(async (req, res) => {
  // For stateless JWT, client drops the token.
  // Optionally blacklist token here for production security.
  sendSuccess(res, 200, "Logged out successfully.");
});
