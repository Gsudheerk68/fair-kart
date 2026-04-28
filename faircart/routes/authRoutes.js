/**
 * routes/authRoutes.js
 */
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

// Validation rules
const registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["user", "shopOwner"]).withMessage("Role must be 'user' or 'shopOwner'"),
];

const loginRules = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerRules, validate, authController.register);
router.post("/login",    loginRules, validate, authController.login);

// Protected routes
router.use(protect); // All routes below require auth
router.get("/me",                authController.getMe);
router.put("/update-profile",    authController.updateProfile);
router.put("/update-location",   authController.updateLocation);
router.put("/change-password",   authController.changePassword);
router.post("/logout",           authController.logout);

module.exports = router;
