/**
 * MAUSAM Backend - Weather Route (Placeholder)
 * Module 3.1: Node.js + Express Backend Foundation
 */

import { Router } from 'express';
import { getWeather } from '../controllers/weatherController.js';

const router = Router();

// GET /api/weather
router.get('/', getWeather);

export default router;
