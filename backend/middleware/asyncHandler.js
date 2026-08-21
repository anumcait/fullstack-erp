// backend/middleware/asyncHandler.js
// Wraps an async route handler so rejected promises are forwarded to the
// centralized errorHandler (required for Express <5; harmless on Express 5).
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
