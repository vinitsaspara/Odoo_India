import Booking from '../models/Booking.js';
import Court from '../models/Court.js';
import Venue from '../models/Venue.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Authenticated users)
export const createBooking = async (req, res) => {
    try {
        const { venueId, courtId, startTime, endTime, paymentStatus } = req.body;

        // Validate required fields
        if (!venueId || !courtId || !startTime || !endTime || !paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Please provide venueId, courtId, startTime, endTime, and paymentStatus'
            });
        }

        // Validate ObjectId formats
        if (!venueId.match(/^[0-9a-fA-F]{24}$/) || !courtId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid venue ID or court ID format'
            });
        }

        // Parse and validate dates
        const bookingStartTime = new Date(startTime);
        const bookingEndTime = new Date(endTime);

        if (isNaN(bookingStartTime.getTime()) || isNaN(bookingEndTime.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format for startTime or endTime'
            });
        }

        // Check if booking is in the future
        const now = new Date();
        if (bookingStartTime <= now) {
            return res.status(400).json({
                success: false,
                message: 'Booking start time must be in the future'
            });
        }

        // Check if end time is after start time
        if (bookingEndTime <= bookingStartTime) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time'
            });
        }

        // Find court and venue
        const court = await Court.findById(courtId).populate('venueId');
        if (!court) {
            return res.status(404).json({
                success: false,
                message: 'Court not found'
            });
        }

        // Verify court belongs to the specified venue
        if (court.venueId._id.toString() !== venueId) {
            return res.status(400).json({
                success: false,
                message: 'Court does not belong to the specified venue'
            });
        }

        // Check venue status
        if (court.venueId.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot book courts at venues that are not approved'
            });
        }

        // Check if the booking time is within operating hours
        const bookingDate = new Date(bookingStartTime);
        const dayStart = new Date(bookingDate);
        dayStart.setHours(0, 0, 0, 0);

        const [openHour, openMinute] = court.operatingHours.open.split(':').map(Number);
        const [closeHour, closeMinute] = court.operatingHours.close.split(':').map(Number);

        const openTime = new Date(dayStart);
        openTime.setHours(openHour, openMinute, 0, 0);

        const closeTime = new Date(dayStart);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        if (bookingStartTime < openTime || bookingEndTime > closeTime) {
            return res.status(400).json({
                success: false,
                message: `Booking time must be within operating hours: ${court.operatingHours.open} - ${court.operatingHours.close}`
            });
        }

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            courtId,
            status: { $in: ['booked', 'completed'] },
            $or: [
                {
                    startTime: { $lt: bookingEndTime },
                    endTime: { $gt: bookingStartTime }
                }
            ]
        });

        if (overlappingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Court is not available for the selected time slot',
                conflictingBookings: overlappingBookings.map(booking => ({
                    startTime: booking.startTime,
                    endTime: booking.endTime
                }))
            });
        }

        // Calculate price based on duration and court's price per hour
        const durationInHours = (bookingEndTime - bookingStartTime) / (1000 * 60 * 60);
        const totalPrice = Math.round(durationInHours * court.pricePerHour * 100) / 100; // Round to 2 decimal places

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            venueId,
            courtId,
            startTime: bookingStartTime,
            endTime: bookingEndTime,
            price: totalPrice,
            paymentStatus
        });

        // Populate booking details for response
        await booking.populate([
            { path: 'userId', select: 'name email' },
            { path: 'venueId', select: 'name address' },
            { path: 'courtId', select: 'name sportType pricePerHour' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private (Authenticated users)
export const getUserBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Build filter
        const filter = { userId: req.user._id };

        if (status) {
            filter.status = status;
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get bookings with population
        const bookings = await Booking.find(filter)
            .populate('venueId', 'name address location')
            .populate('courtId', 'name sportType pricePerHour')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get total count
        const totalBookings = await Booking.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / pageSize);

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalBookings,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get owner's venue bookings
// @route   GET /api/bookings/owner
// @access  Private (Owner only)
export const getOwnerBookings = async (req, res) => {
    try {
        const { status, venueId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Get all venues owned by the user
        const ownedVenues = await Venue.find({ ownerId: req.user._id }).select('_id');
        const ownedVenueIds = ownedVenues.map(venue => venue._id);

        if (ownedVenueIds.length === 0) {
            return res.status(200).json({
                success: true,
                bookings: [],
                pagination: {
                    currentPage: 1,
                    totalPages: 0,
                    totalBookings: 0,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        // Build filter
        const filter = { venueId: { $in: ownedVenueIds } };

        if (status) {
            filter.status = status;
        }

        if (venueId) {
            // Verify the specified venue is owned by the user
            if (!ownedVenueIds.some(id => id.toString() === venueId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied. Venue not owned by you'
                });
            }
            filter.venueId = venueId;
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Get bookings with population
        const bookings = await Booking.find(filter)
            .populate('userId', 'name email')
            .populate('venueId', 'name address location')
            .populate('courtId', 'name sportType pricePerHour')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get total count
        const totalBookings = await Booking.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / pageSize);

        res.status(200).json({
            success: true,
            bookings,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalBookings,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
