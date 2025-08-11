import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

const router = express.Router();

// @route   GET /api/admin/venues
// @desc    Get all venues for admin management
// @access  Private (Admin only)
router.get('/venues', verifyToken, requireRoles(['admin']), async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (status) filter.status = status;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const venues = await Venue.find(filter)
            .populate('ownerId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const totalVenues = await Venue.countDocuments(filter);

        res.status(200).json({
            success: true,
            venues,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalVenues / pageSize),
                totalVenues
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/admin/venues/:id/status
// @desc    Update venue status (approve/reject)
// @access  Private (Admin only)
router.put('/venues/:id/status', verifyToken, requireRoles(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        const venue = await Venue.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('ownerId', 'name email');

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Venue status updated to ${status}`,
            venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users for admin management
// @access  Private (Admin only)
router.get('/users', verifyToken, requireRoles(['admin']), async (req, res) => {
    try {
        const { role, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (role) filter.role = role;

        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        const users = await User.find(filter)
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        const totalUsers = await User.countDocuments(filter);

        res.status(200).json({
            success: true,
            users,
            pagination: {
                currentPage: pageNumber,
                totalPages: Math.ceil(totalUsers / pageSize),
                totalUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', verifyToken, requireRoles(['admin']), async (req, res) => {
    try {
        const [
            totalUsers,
            totalVenues,
            totalBookings,
            pendingVenues,
            approvedVenues,
            rejectedVenues
        ] = await Promise.all([
            User.countDocuments(),
            Venue.countDocuments(),
            Booking.countDocuments(),
            Venue.countDocuments({ status: 'pending' }),
            Venue.countDocuments({ status: 'approved' }),
            Venue.countDocuments({ status: 'rejected' })
        ]);

        res.status(200).json({
            success: true,
            stats: {
                users: {
                    total: totalUsers
                },
                venues: {
                    total: totalVenues,
                    pending: pendingVenues,
                    approved: approvedVenues,
                    rejected: rejectedVenues
                },
                bookings: {
                    total: totalBookings
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

export default router;
