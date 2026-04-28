/**
 * utils/apiResponse.js
 * Standardized API response format for every endpoint.
 * Ensures consistent structure across the entire API.
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Human-readable message
 * @param {any} data - Response payload
 * @param {object} meta - Optional pagination/extra metadata
 */
const sendSuccess = (res, statusCode = 200, message = "Success", data = null, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta) response.meta = meta;

  return res.status(statusCode).json(response);
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {any} errors - Detailed error info (validation errors, etc.)
 */
const sendError = (res, statusCode = 500, message = "Internal Server Error", errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) response.errors = errors;

  return res.status(statusCode).json(response);
};

/**
 * Pagination helper — calculates skip/limit and returns meta object
 * @param {number} page - Current page number (1-based)
 * @param {number} limit - Items per page
 * @param {number} total - Total document count
 */
const getPaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

module.exports = { sendSuccess, sendError, getPaginationMeta };
