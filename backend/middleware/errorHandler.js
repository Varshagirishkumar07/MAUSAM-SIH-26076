/**
 * MAUSAM Backend - Error Handling Middleware
 * Module 3.1: Node.js + Express Backend Foundation
 */

import config from '../config/index.js';

/**
 * 404 Not Found Handler for undefined routes
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    service: 'mausam-backend'
  });
}

/**
 * Global Express Error Handler
 * Returns controlled JSON response without leaking stack traces or secrets
 */
export function errorHandler(err, req, res, next) {
  // Handle JSON body parser syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Malformed JSON payload in request body.',
      service: 'mausam-backend'
    });
  }

  // Handle CORS errors
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: 'Forbidden',
      message: err.message,
      service: 'mausam-backend'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const isDev = config.nodeEnv === 'development';

  // Log server errors for debugging
  console.error(`[MAUSAM Error ${statusCode}]`, err.message || err);

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : (err.name || 'Error'),
    message: statusCode === 500 && !isDev ? 'An unexpected internal server error occurred.' : (err.message || 'Error occurred.'),
    service: 'mausam-backend',
    ...(isDev && statusCode === 500 ? { devDetail: err.message } : {})
  });
}
