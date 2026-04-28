/**
 * utils/asyncHandler.js
 * Wraps async route handlers to catch errors automatically.
 * Eliminates the need for try/catch in every controller.
 *
 * Usage:
 *   router.get('/path', asyncHandler(async (req, res) => { ... }));
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
