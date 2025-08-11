import Venue from '../models/Venue.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalVenues = await Venue.countDocuments();
        const pendingVenues = await Venue.countDocuments({ status: 'Pending Approval' });
        const activeVenues = await Venue.countDocuments({ status: 'Active' });
        const totalBookings = await Booking.countDocuments();

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        const newVenuesThisMonth = await Venue.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalVenues,
                pendingVenues,
                activeVenues,
                totalBookings,
                newUsersThisMonth,
                newVenuesThisMonth
            }
        });
    } catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending venues for admin review
// @route   GET /api/admin/venues/pending
// @access  Private (Admin only)
export const getPendingVenues = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get pending venues
        const venues = await Venue.find({ status: 'Pending Approval' })
            .populate('ownerId', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get total count for pagination
        const totalVenues = await Venue.countDocuments({ status: 'Pending Approval' });
        const totalPages = Math.ceil(totalVenues / pageSize);

        res.status(200).json({
            success: true,
            venues,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVenues,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            }
        });
    } catch (error) {
        console.error('Get pending venues error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Approve a venue
// @route   PATCH /api/admin/venues/:id/approve
// @access  Private (Admin only)
export const approveVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        // Find the venue
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if venue is pending
        if (venue.status !== 'Pending Approval') {
            return res.status(400).json({
                success: false,
                message: 'Only pending venues can be approved'
            });
        }

        // Update venue status
        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            {
                status: 'Active',
                adminComments: comments || 'Venue approved',
                approvedAt: new Date(),
                rejectedAt: undefined
            },
            { new: true }
        ).populate('ownerId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Venue approved successfully',
            venue: updatedVenue
        });
    } catch (error) {
        console.error('Approve venue error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Reject a venue
// @route   PATCH /api/admin/venues/:id/reject
// @access  Private (Admin only)
export const rejectVenue = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, comments } = req.body;

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        // Find the venue
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if venue is pending
        if (venue.status !== 'Pending Approval') {
            return res.status(400).json({
                success: false,
                message: 'Only pending venues can be rejected'
            });
        }

        // Update venue status
        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            {
                status: 'Rejected',
                adminComments: reason,
                rejectedAt: new Date(),
                approvedAt: undefined
            },
            { new: true }
        ).populate('ownerId', 'name email');

        res.status(200).json({
            success: true,
            message: 'Venue rejected successfully',
            venue: updatedVenue
        });
    } catch (error) {
        console.error('Reject venue error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all venues for admin management
// @route   GET /api/admin/venues
// @access  Private (Admin only)
export const getAllVenuesForAdmin = async (req, res) => {
    try {
        const {
            status,
            search,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        if (status && status !== 'All') {
            filter.status = status;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } },
                { city: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get venues
        const venues = await Venue.find(filter)
            .populate('ownerId', 'name email phone')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get total count for pagination
        const totalVenues = await Venue.countDocuments(filter);
        const totalPages = Math.ceil(totalVenues / pageSize);

        res.status(200).json({
            success: true,
            venues,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVenues,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            }
        });
    } catch (error) {
        console.error('Get all venues for admin error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get recent activity for admin dashboard
// @route   GET /api/admin/activity
// @access  Private (Admin only)
export const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent venue submissions
        const recentVenues = await Venue.find()
            .populate('ownerId', 'name')
            .sort({ submittedAt: -1 })
            .limit(parseInt(limit))
            .select('name status submittedAt approvedAt rejectedAt ownerId');

        // Get recent user registrations
        const recentUsers = await User.find({ role: { $ne: 'admin' } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name email role createdAt');

        // Format activity feed
        const activities = [];

        // Add venue activities
        recentVenues.forEach(venue => {
            if (venue.status === 'Pending Approval') {
                activities.push({
                    type: 'venue_submitted',
                    message: `New venue "${venue.name}" submitted for review`,
                    timestamp: venue.submittedAt,
                    user: venue.ownerId?.name || 'Unknown',
                    venueId: venue._id
                });
            } else if (venue.status === 'Active' && venue.approvedAt) {
                activities.push({
                    type: 'venue_approved',
                    message: `Venue "${venue.name}" has been approved`,
                    timestamp: venue.approvedAt,
                    user: 'Admin',
                    venueId: venue._id
                });
            } else if (venue.status === 'Rejected' && venue.rejectedAt) {
                activities.push({
                    type: 'venue_rejected',
                    message: `Venue "${venue.name}" has been rejected`,
                    timestamp: venue.rejectedAt,
                    user: 'Admin',
                    venueId: venue._id
                });
            }
        });

        // Add user activities
        recentUsers.forEach(user => {
            activities.push({
                type: 'user_registered',
                message: `New ${user.role} "${user.name}" registered`,
                timestamp: user.createdAt,
                user: 'System',
                userId: user._id
            });
        });

        // Sort activities by timestamp
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.status(200).json({
            success: true,
            activities: activities.slice(0, parseInt(limit))
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update venue status (general admin action)
// @route   PATCH /api/admin/venues/:id/status
// @access  Private (Admin only)
export const updateVenueStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comments } = req.body;

        const validStatuses = ['Pending Approval', 'Active', 'Rejected', 'Under Maintenance'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const updateData = { status };

        if (comments) {
            updateData.adminComments = comments;
        }

        if (status === 'Active') {
            updateData.approvedAt = new Date();
            updateData.rejectedAt = undefined;
        } else if (status === 'Rejected') {
            updateData.rejectedAt = new Date();
            updateData.approvedAt = undefined;
        }

        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('ownerId', 'name email');

        if (!updatedVenue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Venue status updated successfully',
            venue: updatedVenue
        });
    } catch (error) {
        console.error('Update venue status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
