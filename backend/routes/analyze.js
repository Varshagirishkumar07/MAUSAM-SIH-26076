/**
 * MAUSAM Backend - Analysis Router
 * Module 3.3: Weather Analysis + Personalization Rule Engine
 */

import { Router } from 'express';
import { postAnalyze, getAnalyze } from '../controllers/analyzeController.js';

const router = Router();

// POST /api/analyze - Evaluates provided context + weather
router.post('/', postAnalyze);

// GET /api/analyze - Fetches real Open-Meteo weather and analyzes in one call
router.get('/', getAnalyze);

export default router;
