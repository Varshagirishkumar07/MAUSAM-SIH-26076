/**
 * MAUSAM Backend - Main Express Server
 * Module 3.1: Node.js + Express Backend Foundation
 * Smart India Hackathon (SIH) Problem Statement 26076
 */

import express from 'express';
import config from './config/index.js';
import { configureCors } from './middleware/cors.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import healthRouter from './routes/health.js';
import weatherRouter from './routes/weather.js';
import analyzeRouter from './routes/analyze.js';
import guidanceRouter from './routes/guidance.js';

const app = express();

// Security & Parsing Middleware
app.disable('x-powered-by');
app.use(configureCors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`[MAUSAM API] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// API Routes
app.use('/api/health', healthRouter);
app.use('/api/weather', weatherRouter);
app.use('/api/analyze', analyzeRouter);
app.use('/api/guidance', guidanceRouter);

// Serve static frontend assets from project root
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootStaticPath = path.resolve(__dirname, '..');
app.use(express.static(rootStaticPath));

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
const PORT = config.port;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`[MAUSAM Backend] Server running on http://localhost:${PORT}`);
  console.log(`[MAUSAM Backend] Environment: ${config.nodeEnv}`);
  console.log(`[MAUSAM Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[MAUSAM Backend] Weather placeholder: http://localhost:${PORT}/api/weather`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[MAUSAM Backend] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[MAUSAM Backend] Server closed.');
    process.exit(0);
  });
});

export default app;
