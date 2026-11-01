import { Router } from 'express';
import { getHealth, getDatabaseHealth } from '../controllers/health.controller.js';

const router = Router();

// Base health check: /api/health
router.get('/', getHealth);

// Database health check: /api/health/db
router.get('/db', getDatabaseHealth);

export default router;
