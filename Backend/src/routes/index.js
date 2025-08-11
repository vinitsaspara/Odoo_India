import express from 'express';
import authRoutes from './authRoutes.js';
import venueRoutes from './venueRoutes.js';
import courtRoutes from './courtRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/venues', venueRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

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
