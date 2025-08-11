import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import {
    createVenue,
    getVenues,
    getVenueById,
    updateVenue,
    deleteVenue,
    uploadVenueImages
} from '../controllers/venueController.js';
import {
    getOwnerEarnings,
    getVenueEarnings,
    getEarningsHistory,
    markEarningsAsPaid
} from '../controllers/ownerController.js';

const router = express.Router();

// @route   POST /api/owner/venues
// @desc    Create a new venue (owner)
// @access  Private (Owner only)
router.post('/venues', verifyToken, requireRoles(['owner']), uploadVenueImages, createVenue);

// @route   GET /api/owner/venues
// @desc    Get owner's venues
// @access  Private (Owner only)
router.get('/venues', verifyToken, requireRoles(['owner']), async (req, res) => {
    // Add ownerId to query params
    req.query.ownerId = req.user._id;
    // Call the general getVenues function
    return getVenues(req, res);
});

// @route   GET /api/owner/venues/:id
// @desc    Get venue by ID (owner)
// @access  Private (Owner only)
router.get('/venues/:id', verifyToken, requireRoles(['owner']), async (req, res) => {
    try {
        // First get the venue
        const venue = await getVenueById(req, res);

        // Additional ownership check is handled in the controller
        return venue;
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/owner/venues/:id
// @desc    Update venue (owner)
// @access  Private (Owner only)
router.put('/venues/:id', verifyToken, requireRoles(['owner']), uploadVenueImages, updateVenue);

// @route   DELETE /api/owner/venues/:id
// @desc    Delete venue (owner)
// @access  Private (Owner only)
router.delete('/venues/:id', verifyToken, requireRoles(['owner']), deleteVenue);

// Earnings Routes
// @route   GET /api/owner/earnings
// @desc    Get owner earnings summary
// @access  Private (Owner only)
router.get('/earnings', verifyToken, requireRoles(['owner']), getOwnerEarnings);

// @route   GET /api/owner/earnings/venue/:venueId
// @desc    Get earnings for a specific venue
// @access  Private (Owner only)
router.get('/earnings/venue/:venueId', verifyToken, requireRoles(['owner']), getVenueEarnings);

// @route   GET /api/owner/earnings/history
// @desc    Get earnings history with pagination
// @access  Private (Owner only)
router.get('/earnings/history', verifyToken, requireRoles(['owner']), getEarningsHistory);

// @route   PUT /api/owner/earnings/mark-paid/:venueId
// @desc    Mark earnings as paid (admin function)
// @access  Private (Admin only - for future implementation)
router.put('/earnings/mark-paid/:venueId', verifyToken, requireRoles(['admin']), markEarningsAsPaid);

export default router;
