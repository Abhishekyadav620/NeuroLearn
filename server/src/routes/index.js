import { Router } from 'express';
import healthRoutes from './health.routes.js';

const router = Router();

// Mount sub-routers
router.use('/health', healthRoutes);

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
