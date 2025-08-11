import express from 'express';
import {
    createVenue,
    getVenues,
    getVenueById,
    updateVenue,
    deleteVenue,
    deleteVenueImage,
    uploadVenueImages
} from '../controllers/venueController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// @route   POST /api/venues
// @desc    Create a new venue
// @access  Private (Owner only)
router.post('/', verifyToken, requireRoles(['owner']), uploadVenueImages, createVenue);

// @route   GET /api/venues
// @desc    Get all venues with filters
// @access  Public
router.get('/', getVenues);

// @route   GET /api/venues/:id
// @desc    Get venue by ID
// @access  Public
router.get('/:id', getVenueById);

// @route   PUT /api/venues/:id
// @desc    Update venue
// @access  Private (Owner only)
router.put('/:id', verifyToken, requireRoles(['owner']), uploadVenueImages, updateVenue);

// @route   DELETE /api/venues/:id
// @desc    Delete venue
// @access  Private (Owner only)
router.delete('/:id', verifyToken, requireRoles(['owner']), deleteVenue);

// @route   DELETE /api/venues/:id/images/:imageId
// @desc    Delete image from venue
// @access  Private (Owner only)
router.delete('/:id/images/:imageId', verifyToken, requireRoles(['owner']), deleteVenueImage);

export default router;
