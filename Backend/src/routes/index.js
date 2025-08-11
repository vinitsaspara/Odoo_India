import express from 'express';
import authRoutes from './authRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);

// Health check route for API
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API Health Check Successful',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

export default router;
