import VenueEarnings from '../models/VenueEarnings.js';
import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';

// @desc    Get owner earnings summary
// @route   GET /api/owner/earnings
// @access  Private (Owner only)
export const getOwnerEarnings = async (req, res) => {
    try {
        const ownerId = req.user._id;

        // Get all venues owned by this user
        const venues = await Venue.find({ ownerId }).select('_id name');
        const venueIds = venues.map(venue => venue._id);

        // Get earnings for all venues
        const venueEarnings = await VenueEarnings.find({
            ownerId,
            venueId: { $in: venueIds }
        }).populate('venueId', 'name address');

        // Calculate total earnings
        const totalEarnings = venueEarnings.reduce((sum, earning) => sum + earning.totalEarnings, 0);
        const pendingEarnings = venueEarnings.reduce((sum, earning) => sum + earning.pendingEarnings, 0);
        const paidEarnings = venueEarnings.reduce((sum, earning) => sum + earning.paidEarnings, 0);
        const totalBookings = venueEarnings.reduce((sum, earning) => sum + earning.totalBookings, 0);

        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalEarnings,
                    pendingEarnings,
                    paidEarnings,
                    totalBookings,
                    totalVenues: venues.length
                },
                venueEarnings
            }
        });

    } catch (error) {
        console.error('Get owner earnings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get earnings for a specific venue
// @route   GET /api/owner/earnings/venue/:venueId
// @access  Private (Owner only)
export const getVenueEarnings = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { venueId } = req.params;

        // Verify venue ownership
        const venue = await Venue.findOne({ _id: venueId, ownerId });
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found or unauthorized'
            });
        }

        // Get venue earnings
        const earnings = await VenueEarnings.findOne({
            venueId,
            ownerId
        }).populate('venueId', 'name address');

        // Get recent bookings for this venue
        const recentBookings = await Booking.find({
            venueId,
            ownerId,
            status: 'booked',
            paymentStatus: 'paid'
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('userId', 'name email')
            .select('date startTime endTime price ownerEarnings platformFee createdAt');

        res.status(200).json({
            success: true,
            data: {
                earnings: earnings || {
                    venueId,
                    ownerId,
                    totalEarnings: 0,
                    pendingEarnings: 0,
                    paidEarnings: 0,
                    totalBookings: 0,
                    lastBookingDate: null
                },
                recentBookings
            }
        });

    } catch (error) {
        console.error('Get venue earnings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get earnings history with pagination
// @route   GET /api/owner/earnings/history
// @access  Private (Owner only)
export const getEarningsHistory = async (req, res) => {
    try {
        const ownerId = req.user._id;
        const { page = 1, limit = 20, venueId, startDate, endDate } = req.query;

        const skip = (page - 1) * limit;

        // Build query filter
        const filter = {
            ownerId,
            status: 'booked',
            paymentStatus: 'paid'
        };

        if (venueId) {
            filter.venueId = venueId;
        }

        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        // Get bookings with earnings
        const bookings = await Booking.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('venueId', 'name address')
            .populate('userId', 'name email')
            .select('date startTime endTime price ownerEarnings platformFee payoutDate paidToOwner createdAt');

        const totalBookings = await Booking.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                bookings,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalBookings / limit),
                    totalBookings,
                    hasNext: page * limit < totalBookings,
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error('Get earnings history error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mark earnings as paid (admin function - for future use)
// @route   PUT /api/owner/earnings/mark-paid/:venueId
// @access  Private (Admin only - for future implementation)
export const markEarningsAsPaid = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { amount, payoutDate = new Date() } = req.body;

        const earnings = await VenueEarnings.findOne({ venueId });
        if (!earnings) {
            return res.status(404).json({
                success: false,
                message: 'Venue earnings not found'
            });
        }

        // Update earnings
        earnings.paidEarnings += amount;
        earnings.pendingEarnings = Math.max(0, earnings.pendingEarnings - amount);
        earnings.lastPayoutDate = payoutDate;
        await earnings.save();

        // Mark individual bookings as paid
        await Booking.updateMany(
            {
                venueId,
                paymentStatus: 'paid',
                paidToOwner: { $ne: true }
            },
            {
                paidToOwner: true,
                payoutDate
            }
        );

        res.status(200).json({
            success: true,
            message: 'Earnings marked as paid successfully',
            data: earnings
        });

    } catch (error) {
        console.error('Mark earnings as paid error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
