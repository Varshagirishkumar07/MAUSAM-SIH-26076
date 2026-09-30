/**
 * MAUSAM Backend - Centralized Configuration
 * Module 3.1: Node.js + Express Backend Foundation
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    // Permitted local development origins
    allowedOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL
    ].filter(Boolean)
  },
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1',
    timeoutMs: parseInt(process.env.WEATHER_REQUEST_TIMEOUT_MS, 10) || 8000,
    cacheTtlMs: parseInt(process.env.WEATHER_CACHE_TTL_MS, 10) || 600000 // 10 minutes
  }
});

export default config;
