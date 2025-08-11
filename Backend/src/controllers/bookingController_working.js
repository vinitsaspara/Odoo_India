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
// @route   GET /api/bookings/availability/:venueId/:courtId
// @access  Public
export const getAvailableSlots = async (req, res) => {
    try {
        const { venueId, courtId } = req.params;
        const { date } = req.query;

        if (!date) {
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
        if (venue.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Venue is not available for booking'
            });
        }

        // Get day of week
        const bookingDate = new Date(date);
        const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        
        // Get operating hours (use venue default if court doesn't have specific hours)
        const operatingHours = venue.operatingHours?.[dayOfWeek];
        
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
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await Booking.find({
            venueId,
            courtId,
            startTime: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['booked', 'confirmed'] }
        });

        // Check availability for each slot
        const availableSlots = allSlots.map(slot => {
            const slotStart = new Date(bookingDate);
            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            slotStart.setHours(startHour, startMinute, 0, 0);
            
            const slotEnd = new Date(bookingDate);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
            slotEnd.setHours(endHour, endMinute, 0, 0);

            // Check if slot overlaps with existing bookings
            const isBooked = existingBookings.some(booking => {
                return (booking.startTime < slotEnd && booking.endTime > slotStart);
            });

            return {
                ...slot,
                available: !isBooked,
                price: court.pricePerHour
            };
        });

        res.status(200).json({
            success: true,
            availableSlots,
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
        const { venueId, courtId, date, startTime, endTime, notes } = req.body;

        // Validate required fields
        if (!venueId || !courtId || !date || !startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: venueId, courtId, date, startTime, endTime'
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

        // Check venue status
        if (venue.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Venue is not available for booking'
            });
        }

        // Parse booking date and times
        const bookingDate = new Date(date);
        const bookingStart = new Date(`${date}T${startTime}:00`);
        const bookingEnd = new Date(`${date}T${endTime}:00`);

        // Validate booking is in the future
        if (bookingStart <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Booking time must be in the future'
            });
        }

        // Validate end time is after start time
        if (bookingEnd <= bookingStart) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time'
            });
        }

        // Check operating hours
        const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const operatingHours = venue.operatingHours?.[dayOfWeek];
        
        if (!operatingHours || !operatingHours.isOpen) {
            return res.status(400).json({
                success: false,
                message: 'Venue is closed on this day'
            });
        }

        const [openHour, openMinute] = operatingHours.openTime.split(':').map(Number);
        const [closeHour, closeMinute] = operatingHours.closeTime.split(':').map(Number);
        
        const openTime = new Date(bookingDate);
        openTime.setHours(openHour, openMinute, 0, 0);
        
        const closeTime = new Date(bookingDate);
        closeTime.setHours(closeHour, closeMinute, 0, 0);

        if (bookingStart < openTime || bookingEnd > closeTime) {
            return res.status(400).json({
                success: false,
                message: `Booking time must be within operating hours: ${operatingHours.openTime} - ${operatingHours.closeTime}`
            });
        }

        // Check for overlapping bookings
        const overlappingBookings = await Booking.find({
            venueId,
            courtId,
            status: { $in: ['booked', 'confirmed'] },
            $or: [
                {
                    startTime: { $lt: bookingEnd },
                    endTime: { $gt: bookingStart }
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
        const durationInHours = (bookingEnd - bookingStart) / (1000 * 60 * 60);
        const totalPrice = Math.round(durationInHours * court.pricePerHour * 100) / 100;

        // Create booking
        const booking = await Booking.create({
            userId: req.user._id,
            venueId,
            courtId,
            startTime: bookingStart,
            endTime: bookingEnd,
            price: totalPrice,
            paymentStatus: 'pending',
            notes: notes || ''
        });

        // Populate booking details
        await booking.populate([
            { path: 'userId', select: 'name email phone' },
            { path: 'venueId', select: 'name address phone email' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                ...booking.toObject(),
                courtName: court.name,
                courtSport: court.sportType
            }
        });

    } catch (error) {
        console.error('Create booking error:', error);
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
            .populate('venueId', 'name address city state phone email')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get court details for each booking
        const bookingsWithCourtDetails = await Promise.all(
            bookings.map(async (booking) => {
                const venue = await Venue.findById(booking.venueId);
                const court = venue?.courts.id(booking.courtId);
                
                return {
                    ...booking.toObject(),
                    courtName: court?.name || 'Unknown Court',
                    courtSport: court?.sportType || 'Unknown Sport'
                };
            })
        );

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
        const { reason } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns this booking
        if (booking.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if booking can be cancelled
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

        // Check cancellation deadline (e.g., 2 hours before start time)
        const cancellationDeadline = new Date(booking.startTime);
        cancellationDeadline.setHours(cancellationDeadline.getHours() - 2);

        if (new Date() > cancellationDeadline) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel booking less than 2 hours before start time'
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
        const { status, page = 1, limit = 10, venueId } = req.query;

        // Get owner's venues
        const venues = await Venue.find({ ownerId: req.user._id }).select('_id');
        const venueIds = venues.map(venue => venue._id);

        if (venueIds.length === 0) {
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
        const filter = { venueId: { $in: venueIds } };

        if (status) {
            filter.status = status;
        }

        if (venueId) {
            filter.venueId = venueId;
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Get bookings
        const bookings = await Booking.find(filter)
            .populate('userId', 'name email phone')
            .populate('venueId', 'name address')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(pageSize);

        // Get court details for each booking
        const bookingsWithCourtDetails = await Promise.all(
            bookings.map(async (booking) => {
                const venue = await Venue.findById(booking.venueId);
                const court = venue?.courts.id(booking.courtId);
                
                return {
                    ...booking.toObject(),
                    courtName: court?.name || 'Unknown Court',
                    courtSport: court?.sportType || 'Unknown Sport'
                };
            })
        );

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
        console.error('Get owner bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
