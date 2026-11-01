import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './authRoutes.js';
import courseRoutes from './courseRoutes.js';
import enrollmentRoutes from './enrollmentRoutes.js';
import behaviourRoutes from './behaviourRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/behaviour', behaviourRoutes);
router.use('/analytics', analyticsRoutes);

// Root /api endpoint information
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the NeuroLearn API',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});

export default router;
