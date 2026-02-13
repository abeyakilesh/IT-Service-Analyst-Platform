/**
 * Wraps an async route handler to automatically catch errors
 * and pass them to the Express error handler middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
