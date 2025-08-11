import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import {
    getAdminStats,
    getPendingVenues,
    approveVenue,
    rejectVenue,
    getAllVenuesForAdmin,
    getRecentActivity,
    updateVenueStatus
} from '../controllers/adminController.js';

const router = express.Router();

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/stats', verifyToken, requireRoles(['admin']), getAdminStats);

// @route   GET /api/admin/venues/pending
// @desc    Get all pending venues for review
// @access  Private (Admin only)
router.get('/venues/pending', verifyToken, requireRoles(['admin']), getPendingVenues);

// @route   PATCH /api/admin/venues/:id/approve
// @desc    Approve a venue
// @access  Private (Admin only)
router.patch('/venues/:id/approve', verifyToken, requireRoles(['admin']), approveVenue);

// @route   PATCH /api/admin/venues/:id/reject
// @desc    Reject a venue
// @access  Private (Admin only)
router.patch('/venues/:id/reject', verifyToken, requireRoles(['admin']), rejectVenue);

// @route   PATCH /api/admin/venues/:id/status
// @desc    Update venue status (general)
// @access  Private (Admin only)
router.patch('/venues/:id/status', verifyToken, requireRoles(['admin']), updateVenueStatus);

// @route   GET /api/admin/venues
// @desc    Get all venues for admin management
// @access  Private (Admin only)
router.get('/venues', verifyToken, requireRoles(['admin']), getAllVenuesForAdmin);

// @route   GET /api/admin/activity
// @desc    Get recent activity for admin dashboard
// @access  Private (Admin only)
router.get('/activity', verifyToken, requireRoles(['admin']), getRecentActivity);

export default router;
