/**
 * MAUSAM Backend - CORS Middleware
 * Module 3.1: Node.js + Express Backend Foundation
 */

import cors from 'cors';
import config from '../config/index.js';

export function configureCors() {
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      const isAllowed = config.cors.allowedOrigins.some((allowed) => {
        const normalizedAllowed = allowed.trim().replace(/\/+$/, '');
        if (normalizedAllowed === normalizedOrigin) return true;
        // Support any port on localhost during local development
        if (config.nodeEnv === 'development' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin)) {
          return true;
        }
        return false;
      });

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS origin not permitted: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  };

  return cors(corsOptions);
}
