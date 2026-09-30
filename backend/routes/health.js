/**
 * MAUSAM Backend - Health Route
 * Module 3.1: Node.js + Express Backend Foundation
 */

import { Router } from 'express';
import { getHealth } from '../controllers/healthController.js';

const router = Router();

// GET /api/health
router.get('/', getHealth);

export default router;
