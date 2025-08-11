import express from 'express';
import {
    createVenue,
    getVenues,
    getVenueById
} from '../controllers/venueController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/venues
// @desc    Create a new venue
// @access  Private (Owner only)
router.post('/', verifyToken, requireRoles(['owner', 'admin']), createVenue);

// @route   GET /api/venues
// @desc    Get all venues with filters
// @access  Public
router.get('/', getVenues);

// @route   GET /api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', getVenueById);

export default router;
