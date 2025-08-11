import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';

// Smart helper functions for booking system

// Calculate dynamic pricing based on time, date, and demand
const calculateDynamicPrice = (court, bookingDate, startTime, endTime) => {
    let basePrice = court.pricePerHour;
    let multiplier = 1;

    if (!court.dynamicPricing?.enabled) {
        return basePrice;
    }

    const bookingDay = bookingDate.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = bookingDay === 0 || bookingDay === 6;

    // Weekend pricing
    if (isWeekend && court.dynamicPricing.weekendMultiplier) {
        multiplier *= court.dynamicPricing.weekendMultiplier;
    }

    // Peak hours pricing
    const startHour = startTime.getHours();
    const endHour = endTime.getHours();

    court.dynamicPricing.peakHours?.forEach(peak => {
        const [peakStartHour] = peak.start.split(':').map(Number);
        const [peakEndHour] = peak.end.split(':').map(Number);

        if ((startHour >= peakStartHour && startHour < peakEndHour) ||
            (endHour > peakStartHour && endHour <= peakEndHour)) {
            multiplier *= peak.multiplier;
        }
    });

    return Math.round(basePrice * multiplier * 100) / 100;
};

// Generate time slots for a court
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

// Check if court is available during maintenance
const isCourtInMaintenance = (court, startTime, endTime) => {
    if (!court.maintenanceSchedule || court.maintenanceSchedule.length === 0) {
        return false;
    }

    return court.maintenanceSchedule.some(maintenance => {
        const maintenanceStart = new Date(maintenance.startDate);
        const maintenanceEnd = new Date(maintenance.endDate);

        return (startTime < maintenanceEnd && endTime > maintenanceStart);
    });
};

// @desc    Get available slots for a court on a specific date
// @route   GET /api/bookings/availability/:venueId/:courtId
// @access  Public
export const getAvailableSlots = async (req, res) => {
    try {
        const { venueId, courtId } = req.params;
        const { date, participants = 1 } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date is required'
            });
        }

        // Validate date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check availability for past dates'
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

        // Check if court is active
        if (!court.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Court is not available for booking'
            });
        }

        // Check advance booking limit
        const maxBookingDate = new Date();
        maxBookingDate.setDate(maxBookingDate.getDate() + court.advanceBookingDays);

        if (selectedDate > maxBookingDate) {
            return res.status(400).json({
                success: false,
                message: `Booking only allowed up to ${court.advanceBookingDays} days in advance`
            });
        }

        // Get day of week
        const bookingDate = new Date(date);
        const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });

        // Get operating hours (court specific or venue default)
        const operatingHours = court.operatingHours?.[dayOfWeek] || venue.operatingHours?.[dayOfWeek];

        if (!operatingHours || !operatingHours.isOpen) {
            return res.status(200).json({
                success: true,
                availableSlots: [],
                message: 'Venue is closed on this day'
            });
        }

        // Generate all possible time slots
        const allSlots = generateTimeSlots(
            operatingHours.openTime,
            operatingHours.closeTime,
            court.slotDuration
        );

        // Get existing bookings for this court and date
        const startOfDay = new Date(bookingDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(bookingDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingBookings = await Booking.find({
            venueId,
            courtId,
            bookingDate: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['pending', 'confirmed'] }
        });

        // Check availability for each slot
        const availableSlots = allSlots.map(slot => {
            const slotStart = new Date(bookingDate);
            const [startHour, startMinute] = slot.startTime.split(':').map(Number);
            slotStart.setHours(startHour, startMinute, 0, 0);

            const slotEnd = new Date(bookingDate);
            const [endHour, endMinute] = slot.endTime.split(':').map(Number);
            slotEnd.setHours(endHour, endMinute, 0, 0);

            // Check maintenance
            const inMaintenance = isCourtInMaintenance(court, slotStart, slotEnd);

            // Count overlapping bookings
            const overlappingBookings = existingBookings.filter(booking => {
                return (booking.startTime < slotEnd && booking.endTime > slotStart);
            });

            const bookedCapacity = overlappingBookings.reduce((total, booking) => {
                return total + booking.participants;
            }, 0);

            const availableCapacity = court.capacity - bookedCapacity;
            const canAccommodateRequest = availableCapacity >= parseInt(participants);

            // Calculate dynamic price
            const dynamicPrice = calculateDynamicPrice(court, bookingDate, slotStart, slotEnd);

            return {
                ...slot,
                available: !inMaintenance && canAccommodateRequest,
                availableCapacity,
                totalCapacity: court.capacity,
                requestedParticipants: parseInt(participants),
                price: dynamicPrice,
                originalPrice: court.pricePerHour,
                isPeakTime: dynamicPrice > court.pricePerHour,
                inMaintenance,
                reason: inMaintenance ? 'Under maintenance' :
                    !canAccommodateRequest ? 'Insufficient capacity' : null
            };
        });

        res.status(200).json({
            success: true,
            availableSlots,
            courtInfo: {
                name: court.name,
                sportType: court.sportType,
                capacity: court.capacity,
                minParticipants: court.minParticipants,
                pricePerHour: court.pricePerHour,
                slotDuration: court.slotDuration,
                features: court.features,
                equipment: court.equipment,
                dynamicPricingEnabled: court.dynamicPricing?.enabled || false
            },
            venueInfo: {
                name: venue.name,
                address: venue.address,
                city: venue.city
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

// @desc    Create a smart booking with advanced features
// @route   POST /api/bookings
// @access  Private (Authenticated users)
export const createBooking = async (req, res) => {
    try {
        const {
            venueId,
            courtId,
            date,
            startTime,
            endTime,
            participants,
            participantDetails = [],
            notes,
            specialRequests,
            bookingSource = 'web',
            isRecurring = false,
            recurringPattern = null
        } = req.body;

        // Validate required fields
        if (!venueId || !courtId || !date || !startTime || !endTime || !participants) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields: venueId, courtId, date, startTime, endTime, participants'
            });
        }

        // Validate participants
        if (participants < 1) {
            return res.status(400).json({
                success: false,
                message: 'Number of participants must be at least 1'
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

        // Check venue and court status
        if (venue.status !== 'Active') {
            return res.status(400).json({
                success: false,
                message: 'Venue is not available for booking'
            });
        }

        if (!court.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Court is not available for booking'
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

        // Check advance booking limit
        const maxBookingDate = new Date();
        maxBookingDate.setDate(maxBookingDate.getDate() + court.advanceBookingDays);

        if (bookingDate > maxBookingDate) {
            return res.status(400).json({
                success: false,
                message: `Booking only allowed up to ${court.advanceBookingDays} days in advance`
            });
        }

        // Validate end time is after start time
        if (bookingEnd <= bookingStart) {
            return res.status(400).json({
                success: false,
                message: 'End time must be after start time'
            });
        }

        // Calculate duration
        const duration = (bookingEnd - bookingStart) / (1000 * 60); // in minutes

        // Check minimum duration
        if (duration < 30) {
            return res.status(400).json({
                success: false,
                message: 'Minimum booking duration is 30 minutes'
            });
        }

        // Check slot duration alignment
        if (duration % court.slotDuration !== 0) {
            return res.status(400).json({
                success: false,
                message: `Booking duration must be in multiples of ${court.slotDuration} minutes`
            });
        }

        // Check participant limits
        if (participants < court.minParticipants) {
            return res.status(400).json({
                success: false,
                message: `Minimum ${court.minParticipants} participants required`
            });
        }

        if (participants > court.capacity) {
            return res.status(400).json({
                success: false,
                message: `Number of participants (${participants}) exceeds court capacity (${court.capacity})`
            });
        }

        // Check operating hours
        const dayOfWeek = bookingDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const operatingHours = court.operatingHours?.[dayOfWeek] || venue.operatingHours?.[dayOfWeek];

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

        // Check maintenance schedule
        if (isCourtInMaintenance(court, bookingStart, bookingEnd)) {
            return res.status(400).json({
                success: false,
                message: 'Court is under maintenance during the selected time'
            });
        }

        // Check for capacity conflicts
        const conflictingBookings = await Booking.find({
            venueId,
            courtId,
            bookingDate: {
                $gte: new Date(date + 'T00:00:00'),
                $lte: new Date(date + 'T23:59:59')
            },
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    startTime: { $lt: bookingEnd },
                    endTime: { $gt: bookingStart }
                }
            ]
        });

        // Calculate total participants in conflicting slots
        const totalConflictingParticipants = conflictingBookings.reduce((total, booking) => {
            return total + booking.participants;
        }, 0);

        if (totalConflictingParticipants + participants > court.capacity) {
            return res.status(400).json({
                success: false,
                message: `Court capacity exceeded. Available capacity: ${court.capacity - totalConflictingParticipants}, Requested: ${participants}`,
                availableCapacity: court.capacity - totalConflictingParticipants
            });
        }

        // Calculate pricing with dynamic pricing
        const dynamicPricePerHour = calculateDynamicPrice(court, bookingDate, bookingStart, bookingEnd);
        const basePrice = court.pricePerHour;
        const durationInHours = duration / 60;
        const totalPrice = Math.round(dynamicPricePerHour * durationInHours * 100) / 100;

        // Calculate taxes (assuming 18% GST)
        const taxes = Math.round(totalPrice * 0.18 * 100) / 100;
        const finalAmount = totalPrice + taxes;

        // Create booking
        const bookingData = {
            userId: req.user._id,
            venueId,
            courtId,
            bookingDate,
            startTime: bookingStart,
            endTime: bookingEnd,
            duration,
            participants,
            participantDetails: participantDetails.slice(0, participants), // Limit to actual participants
            pricePerHour: basePrice,
            basePrice,
            dynamicPriceMultiplier: dynamicPricePerHour / basePrice,
            totalPrice,
            taxes,
            finalAmount,
            notes: notes || '',
            specialRequests: specialRequests || '',
            bookingSource,
            status: 'pending' // Will be confirmed after payment
        };

        // Add recurring pattern if specified
        if (isRecurring && recurringPattern) {
            bookingData.isRecurring = true;
            bookingData.recurringPattern = recurringPattern;
        }

        const booking = await Booking.create(bookingData);

        // Populate booking details
        await booking.populate([
            { path: 'userId', select: 'name email phone' },
            { path: 'venueId', select: 'name address phone email city state' }
        ]);

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                ...booking.toObject(),
                courtName: court.name,
                courtSport: court.sportType,
                courtFeatures: court.features,
                courtEquipment: court.equipment,
                priceBreakdown: {
                    basePrice: basePrice,
                    dynamicPrice: dynamicPricePerHour,
                    totalPrice: totalPrice,
                    taxes: taxes,
                    finalAmount: finalAmount,
                    isPeakTime: dynamicPricePerHour > basePrice
                }
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