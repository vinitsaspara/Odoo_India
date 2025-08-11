import Court from '../models/Court.js';
import Venue from '../models/Venue.js';
import Booking from '../models/Booking.js';

// @desc    Add court to venue
// @route   POST /api/venues/:venueId/courts
// @access  Private (Owner only)
export const addCourtToVenue = async (req, res) => {
    try {
        const { venueId } = req.params;
        const { name, sportType, pricePerHour, operatingHours, slotDuration } = req.body;

        // Validate ObjectId format
        if (!venueId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid venue ID format'
            });
        }

        // Check if venue exists and belongs to the authenticated owner
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if the authenticated user owns this venue
        if (venue.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only add courts to your own venues'
            });
        }

        // Validate required fields
        if (!name || !sportType || !pricePerHour || !operatingHours || !slotDuration) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, sportType, pricePerHour, operatingHours, and slotDuration'
            });
        }

        // Validate operating hours format
        if (!operatingHours.open || !operatingHours.close) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both open and close times in operatingHours'
            });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(operatingHours.open) || !timeRegex.test(operatingHours.close)) {
            return res.status(400).json({
                success: false,
                message: 'Operating hours must be in HH:MM format (24-hour)'
            });
        }

        // Validate price and slot duration
        if (pricePerHour <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Price per hour must be greater than 0'
            });
        }

        if (slotDuration < 15 || slotDuration > 240) {
            return res.status(400).json({
                success: false,
                message: 'Slot duration must be between 15 and 240 minutes'
            });
        }

        // Create court
        const court = await Court.create({
            venueId,
            name: name.trim(),
            sportType: sportType.trim(),
            pricePerHour,
            operatingHours: {
                open: operatingHours.open,
                close: operatingHours.close
            },
            slotDuration
        });

        // Populate venue details in response
        await court.populate('venueId', 'name address');

        res.status(201).json({
            success: true,
            message: 'Court added successfully',
            court
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get court availability
// @route   GET /api/courts/:courtId/availability
// @access  Public
export const getCourtAvailability = async (req, res) => {
    try {
        const { courtId } = req.params;
        const { date } = req.query;

        // Validate ObjectId format
        if (!courtId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid court ID format'
            });
        }

        // Validate date parameter
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a date in YYYY-MM-DD format'
            });
        }

        const requestedDate = new Date(date);
        if (isNaN(requestedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid date format. Please use YYYY-MM-DD'
            });
        }

        // Check if date is in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (requestedDate < today) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check availability for past dates'
            });
        }

        // Find court
        const court = await Court.findById(courtId).populate('venueId', 'name address');
        if (!court) {
            return res.status(404).json({
                success: false,
                message: 'Court not found'
            });
        }

        // Generate all possible time slots for the day
        const allSlots = generateTimeSlots(court.operatingHours, court.slotDuration);

        // Get booked slots for the specified date
        const startOfDay = new Date(requestedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(requestedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await Booking.find({
            courtId,
            startTime: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['booked', 'completed'] } // Exclude cancelled bookings
        }).select('startTime endTime');

        // Convert bookings to slot format for comparison
        const bookedSlots = bookings.map(booking => {
            const startTime = new Date(booking.startTime);
            const endTime = new Date(booking.endTime);
            return {
                start: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
                end: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
            };
        });

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => {
            return !bookedSlots.some(bookedSlot =>
                slot.start === bookedSlot.start && slot.end === bookedSlot.end
            );
        });

        res.status(200).json({
            success: true,
            court: {
                id: court._id,
                name: court.name,
                sportType: court.sportType,
                pricePerHour: court.pricePerHour,
                slotDuration: court.slotDuration,
                venue: court.venueId
            },
            date,
            availableSlots,
            bookedSlots,
            totalSlots: allSlots.length,
            availableCount: availableSlots.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to generate time slots
const generateTimeSlots = (operatingHours, slotDuration) => {
    const slots = [];
    const { open, close } = operatingHours;

    // Parse open and close times
    const [openHour, openMinute] = open.split(':').map(Number);
    const [closeHour, closeMinute] = close.split(':').map(Number);

    const openTime = openHour * 60 + openMinute; // Convert to minutes
    const closeTime = closeHour * 60 + closeMinute; // Convert to minutes

    // Generate slots
    for (let time = openTime; time + slotDuration <= closeTime; time += slotDuration) {
        const startHour = Math.floor(time / 60);
        const startMinute = time % 60;
        const endTime = time + slotDuration;
        const endHour = Math.floor(endTime / 60);
        const endMinute = endTime % 60;

        slots.push({
            start: `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`,
            end: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`,
            duration: slotDuration,
            available: true
        });
    }

    return slots;
};
