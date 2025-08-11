import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';

// Helper function to generate time slots
const generateTimeSlots = (openTime, closeTime, slotDuration) => {
    const slots = [];
    const [openHour, openMinute] = openTime.split(':').map(Number);
    const [closeHour, closeMinute] = closeTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMinute = openMinute;

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute < closeMinute)) {
        const nextMinute = currentMinute + slotDuration;
        const nextHour = currentHour + Math.floor(nextMinute / 60);
        const finalMinute = nextMinute % 60;

        if (nextHour < closeHour || (nextHour === closeHour && finalMinute <= closeMinute)) {
            const startTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            const endTime = `${nextHour.toString().padStart(2, '0')}:${finalMinute.toString().padStart(2, '0')}`;

            slots.push({
                startTime,
                endTime,
                duration: slotDuration
            });
        }

        currentMinute += slotDuration;
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
    }

    return slots;
};

// @desc    Get available slots for a court on a specific date
// @route   GET /api/bookings/available-slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
    try {
        const venueId = req.params.venueId || req.query.venueId;
        const courtId = req.params.courtId || req.query.courtId;
        const { date, selectedDate } = req.query;
        const bookingDate = date || selectedDate;

        if (!venueId || !courtId) {
            return res.status(400).json({
                success: false,
                message: 'Venue ID and Court ID are required'
            });
        }

        if (!bookingDate) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Find venue
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Find court
        const court = venue.courts.id(courtId);
        if (!court) {
            return res.status(404).json({
                success: false,
                message: 'Court not found'
            });
        }

        // Check if venue is active
        if (venue.status !== 'Active' && venue.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Venue is not available for booking'
            });
        }

        // Get day of week
        const selectedDateObj = new Date(bookingDate);
        const dayOfWeek = selectedDateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

        console.log(`Checking availability for ${bookingDate}, day of week: ${dayOfWeek}`);

        // Get operating hours
        const operatingHours = venue.operatingHours?.[dayOfWeek];

        console.log(`Operating hours for ${dayOfWeek}:`, operatingHours);

        if (!operatingHours || !operatingHours.isOpen) {
            return res.status(200).json({
                success: true,
                availableSlots: [],
                message: 'Venue is closed on this day'
            });
        }

        // Generate all possible time slots (using default 60-minute slots)
        const slotDuration = 60; // Default 1 hour slots
        const allSlots = generateTimeSlots(
            operatingHours.openTime,
            operatingHours.closeTime,
            slotDuration
        );

        // Get existing bookings for this court and date
        const bookingDateObj = new Date(bookingDate);
        bookingDateObj.setUTCHours(0, 0, 0, 0);

        const existingBookings = await Booking.find({
            courtId,
            date: bookingDateObj,
            status: { $in: ['booked', 'completed'] }
        });

        console.log(`Found ${existingBookings.length} existing bookings for ${bookingDate}`);

        // Filter out booked slots completely
        const availableSlots = [];

        allSlots.forEach(slot => {
            // Check if slot overlaps with existing bookings
            const isBooked = existingBookings.some(booking =>
                Booking.checkTimeOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)
            );

            // Only add slot if it's not booked
            if (!isBooked) {
                availableSlots.push({
                    ...slot,
                    available: true,
                    price: court.pricePerHour,
                    label: `${slot.startTime} - ${slot.endTime}`
                });
            }
        });

        res.status(200).json({
            success: true,
            availableSlots: availableSlots,
            totalSlots: allSlots.length,
            availableCount: availableSlots.length,
            bookedCount: allSlots.length - availableSlots.length,
            courtInfo: {
                name: court.name,
                sportType: court.sportType,
                pricePerHour: court.pricePerHour
            }
        });

    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Authenticated users)
export const createBooking = async (req, res) => {
    try {
        const { venueId, courtId, date, startTime, endTime, price } = req.body;
        const userId = req.user._id;

        console.log('Creating booking:', { userId, venueId, courtId, date, startTime, endTime, price });

        // Validate required fields
        if (!venueId || !courtId || !date || !startTime || !endTime || !price) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required: venueId, courtId, date, startTime, endTime, price'
            });
        }

        // Validate date format and ensure it's not in the past
        const bookingDate = new Date(date);
        bookingDate.setUTCHours(0, 0, 0, 0); // Set to start of day in UTC

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        if (bookingDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot book for past dates'
            });
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
            return res.status(400).json({
                success: false,
                message: 'Time must be in HH:mm format'
            });
        }

        // Validate that end time is after start time
        if (Booking.timeToMinutes(endTime) <= Booking.timeToMinutes(startTime)) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time'
            });
        }

        // Find venue and court to validate they exist
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        const court = venue.courts.id(courtId);
        if (!court) {
            return res.status(404).json({
                success: false,
                message: 'Court not found'
            });
        }

        // Check for overlapping bookings
        const existingBookings = await Booking.find({
            courtId,
            date: bookingDate,
            status: { $in: ['booked', 'completed'] }
        });

        const hasOverlap = existingBookings.some(booking =>
            Booking.checkTimeOverlap(startTime, endTime, booking.startTime, booking.endTime)
        );

        if (hasOverlap) {
            return res.status(409).json({
                success: false,
                message: 'Court is already booked for the selected time slot'
            });
        }

        // Create the booking
        const booking = await Booking.create({
            userId,
            venueId,
            courtId,
            date: bookingDate,
            startTime,
            endTime,
            price: Number(price),
            status: 'booked'
        });

        console.log('✅ Booking created successfully with ID:', booking._id);

        // Populate the booking with venue and user details
        await booking.populate([
            { path: 'userId', select: 'name email' },
            { path: 'venueId', select: 'name address city' }
        ]);

        // Add court details to response
        const bookingResponse = {
            ...booking.toObject(),
            court: {
                _id: court._id,
                name: court.name,
                sportType: court.sportType
            }
        };

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: bookingResponse
        });

    } catch (error) {
        console.error('❌ Create booking error:', error);

        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create booking. Please try again.',
            error: error.message
        });
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/user
// @access  Private (Authenticated users)
export const getUserBookings = async (req, res) => {
    try {
        const { status, page = 1, limit = 50 } = req.query;
        const userId = req.user._id;

        console.log('Fetching bookings for user:', userId);

        // Build filter
        const filter = { userId };

        if (status && status !== 'All') {
            filter.status = status;
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Get bookings with population and sort by date descending
        const bookings = await Booking.find(filter)
            .populate('venueId', 'name address city state')
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // Add court details to each booking
        const bookingsWithCourtDetails = await Promise.all(
            bookings.map(async (booking) => {
                const venue = await Venue.findById(booking.venueId);
                const court = venue?.courts.id(booking.courtId);

                return {
                    ...booking.toObject(),
                    court: court ? {
                        _id: court._id,
                        name: court.name,
                        sportType: court.sportType
                    } : {
                        name: 'Unknown Court',
                        sportType: 'Unknown Sport'
                    }
                };
            })
        );

        console.log(`Found ${bookings.length} bookings for user`);

        // Get total count
        const totalBookings = await Booking.countDocuments(filter);
        const totalPages = Math.ceil(totalBookings / pageSize);

        res.status(200).json({
            success: true,
            bookings: bookingsWithCourtDetails,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalBookings,
                hasNextPage: pageNumber < totalPages,
                hasPrevPage: pageNumber > 1
            }
        });

    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Authenticated users)
export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find the booking
        const booking = await Booking.findOne({ _id: id, userId });

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if booking can be cancelled (not already cancelled or completed)
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking is already cancelled'
            });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed booking'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            booking
        });

    } catch (error) {
        console.error('Cancel booking error:', error);
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
        const ownerId = req.user._id;

        // Find venues owned by this user
        const venues = await Venue.find({ ownerId });
        const venueIds = venues.map(venue => venue._id);

        // Get bookings for these venues
        const bookings = await Booking.find({ venueId: { $in: venueIds } })
            .populate('userId', 'name email phone')
            .populate('venueId', 'name address')
            .sort({ date: -1, createdAt: -1 });

        // Add court details
        const bookingsWithCourtDetails = await Promise.all(
            bookings.map(async (booking) => {
                const venue = venues.find(v => v._id.toString() === booking.venueId._id.toString());
                const court = venue?.courts.id(booking.courtId);

                return {
                    ...booking.toObject(),
                    court: court ? {
                        _id: court._id,
                        name: court.name,
                        sportType: court.sportType
                    } : {
                        name: 'Unknown Court',
                        sportType: 'Unknown Sport'
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            bookings: bookingsWithCourtDetails
        });

    } catch (error) {
        console.error('Get owner bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
