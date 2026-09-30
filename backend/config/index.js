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

function normalizeOrigin(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  return urlStr.trim().replace(/\/+$/, '');
}

// Built-in allowed origins for local dev and GitHub Pages production
const baseOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://varshagirishkumar07.github.io'
];

const rawFrontendUrl = process.env.FRONTEND_URL ? normalizeOrigin(process.env.FRONTEND_URL) : null;
const allOrigins = new Set(baseOrigins.map(normalizeOrigin));
if (rawFrontendUrl) {
  allOrigins.add(rawFrontendUrl);
}

const config = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  cors: {
    // Permitted origins (deduplicated, trailing-slash normalized)
    allowedOrigins: Array.from(allOrigins)
  },
  openMeteo: {
    baseUrl: process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1',
    timeoutMs: parseInt(process.env.WEATHER_REQUEST_TIMEOUT_MS, 10) || 8000,
    cacheTtlMs: parseInt(process.env.WEATHER_CACHE_TTL_MS, 10) || 600000 // 10 minutes
  }
});

export default config;
