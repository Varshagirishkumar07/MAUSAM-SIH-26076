/**
 * MAUSAM Backend - Actionable Guidance & Alternative Recommendations Router
 * Module 3.4: Actionable Guidance + Alternative Recommendations
 */

import { Router } from 'express';
import { postAnalyze, getAnalyze } from '../controllers/analyzeController.js';

const router = Router();

// POST /api/guidance - Generates actionable guidance and alternative recommendations
router.post('/', postAnalyze);

// GET /api/guidance - Fetches real Open-Meteo weather and generates guidance and alternatives
router.get('/', getAnalyze);

export default router;
