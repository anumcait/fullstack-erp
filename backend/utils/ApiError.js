// backend/utils/ApiError.js
// Standardized application error. Throw these from controllers/services and let
// the centralized errorHandler convert them to a consistent JSON response.
class ApiError extends Error {
  constructor(statusCode, message, code = 'ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }
  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }
  static notFound(message = 'Not found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }
  static conflict(message, details) {
    return new ApiError(409, message, 'CONFLICT', details);
  }
  static internal(message = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL');
  }
}

module.exports = ApiError;
