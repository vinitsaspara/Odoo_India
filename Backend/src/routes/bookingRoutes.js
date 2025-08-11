import express from 'express';
import { 
    createBooking, 
    getUserBookings, 
    getOwnerBookings 
} from '../controllers/bookingController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

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

export default router;
