import express from 'express';
import {
    createBooking,
    getUserBookings,
    getOwnerBookings,
    getAvailableSlots,
    cancelBooking
} from '../controllers/bookingController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// @route   GET /api/bookings/available-slots
// @desc    Get available slots for a court on a specific date
// @access  Public
router.get('/available-slots', getAvailableSlots);

// @route   GET /api/bookings/availability/:venueId/:courtId
// @desc    Get available slots for a court on a specific date (legacy route)
// @access  Public
router.get('/availability/:venueId/:courtId', getAvailableSlots);

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private (Authenticated users)
router.post('/', verifyToken, createBooking);

// @route   GET /api/bookings/user
// @desc    Get user's bookings
// @access  Private (Authenticated users)
router.get('/user', verifyToken, getUserBookings);

// @route   GET /api/bookings/owner
// @desc    Get owner's venue bookings
// @access  Private (Owner only)
router.get('/owner', verifyToken, requireRoles(['owner', 'admin']), getOwnerBookings);

// @route   PATCH /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (Authenticated users)
router.patch('/:id/cancel', verifyToken, cancelBooking);

export default router;
