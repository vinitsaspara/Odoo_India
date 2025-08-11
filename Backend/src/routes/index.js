import express from 'express';
import authRoutes from './authRoutes.js';
import venueRoutes from './venueRoutes.js';
import courtRoutes from './courtRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import adminRoutes from './adminRoutes.js';
import ownerRoutes from './ownerRoutes.js';
import placeholderRoutes from './placeholderRoutes.js';

const router = express.Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/venues', venueRoutes);
router.use('/courts', courtRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/owner', ownerRoutes);
router.use('/', placeholderRoutes); // Placeholder images

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
