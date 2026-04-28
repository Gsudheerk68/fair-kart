/**
 * middleware/validate.js
 * Runs express-validator checks and returns 400 if any fail.
 * Import validation rule arrays from validators/ and chain this at the end.
 *
 * Usage:
 *   router.post('/register', registerRules, validate, authController.register);
 */

const { validationResult } = require("express-validator");
const { sendError } = require("../utils/apiResponse");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a clean array
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return sendError(res, 400, "Validation failed. Please check your input.", formatted);
  }

  next();
};

module.exports = validate;
