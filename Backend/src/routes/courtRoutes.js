import express from 'express';
import { 
    addCourtToVenue, 
    getCourtAvailability 
} from '../controllers/courtController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/venues/:venueId/courts
// @desc    Add court to venue
// @access  Private (Owner only)
router.post('/venues/:venueId/courts', verifyToken, requireRoles(['owner', 'admin']), addCourtToVenue);

// @route   GET /api/courts/:courtId/availability
// @desc    Get court availability for a specific date
// @access  Public
router.get('/:courtId/availability', getCourtAvailability);

export default router;
