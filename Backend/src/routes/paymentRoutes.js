import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import {
    createCheckoutSession,
    webhookHandler,
    getBookingStatus,
    cleanupExpiredBookings,
    getDebugBookings,
    getVenueStats
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes
router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.get('/booking-status/:sessionId', verifyToken, getBookingStatus);
router.post('/cleanup-expired', verifyToken, cleanupExpiredBookings);
router.get('/debug-bookings', verifyToken, getDebugBookings);

// Public routes
router.get('/venue-stats/:venueId', getVenueStats);

// Webhook route (raw body parsing handled in server.js)
router.post('/webhook/stripe', webhookHandler);

export default router;
