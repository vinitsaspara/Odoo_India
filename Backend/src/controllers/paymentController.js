import stripe from '../config/stripe.js';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import VenueEarnings from '../models/VenueEarnings.js';

// @desc    Create Stripe checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
export const createCheckoutSession = async (req, res) => {
    try {
        // Clean up expired pending bookings first (global cleanup)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const globalCleanup = await Booking.deleteMany({
            status: 'pending_payment',
            createdAt: { $lt: thirtyMinutesAgo }
        });

        console.log(`Global cleanup: Removed ${globalCleanup.deletedCount} expired bookings`);

        const { venueId, courtId, date, startTime, endTime, price } = req.body;
        const userId = req.user._id;

        console.log('Booking request:', { venueId, courtId, date, startTime, endTime, price, userId });

        console.log('Creating checkout session with data:', {
            userId,
            venueId,
            courtId,
            date,
            startTime,
            endTime,
            price
        });

        // Validate required fields
        if (!venueId || !courtId || !date || !startTime || !endTime || !price) {
            return res.status(400).json({
                success: false,
                message: 'All booking details are required'
            });
        }

        // Get venue and court details for the product name
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

        // Check for existing bookings at the same time
        // First, clean up expired pending payments for this specific slot
        const thirtyMinutesAgoCheck = new Date(Date.now() - 30 * 60 * 1000);
        const specificCleanup = await Booking.deleteMany({
            venueId,
            courtId,
            date: new Date(date),
            status: 'pending_payment',
            createdAt: { $lt: thirtyMinutesAgoCheck }
        });

        console.log(`Specific cleanup for ${venueId}/${courtId}/${date}: Removed ${specificCleanup.deletedCount} expired bookings`);

        // Check for any existing bookings (including by the same user)
        const allExistingBookings = await Booking.find({
            venueId,
            courtId,
            date: new Date(date),
            status: { $in: ['pending_payment', 'booked'] }
        });

        console.log('All existing bookings for this slot:', allExistingBookings.map(b => ({
            id: b._id,
            userId: b.userId,
            status: b.status,
            startTime: b.startTime,
            endTime: b.endTime,
            createdAt: b.createdAt,
            age: Math.round((Date.now() - b.createdAt.getTime()) / (1000 * 60)) + ' minutes'
        })));

        // Check for time conflicts
        const existingBooking = await Booking.findOne({
            venueId,
            courtId,
            date: new Date(date),
            $or: [
                {
                    $and: [
                        { startTime: { $lte: startTime } },
                        { endTime: { $gt: startTime } }
                    ]
                },
                {
                    $and: [
                        { startTime: { $lt: endTime } },
                        { endTime: { $gte: endTime } }
                    ]
                },
                {
                    $and: [
                        { startTime: { $gte: startTime } },
                        { endTime: { $lte: endTime } }
                    ]
                }
            ],
            status: { $in: ['pending_payment', 'booked'] }
        });

        if (existingBooking) {
            console.log('Conflict found with existing booking:', {
                id: existingBooking._id,
                userId: existingBooking.userId,
                status: existingBooking.status,
                startTime: existingBooking.startTime,
                endTime: existingBooking.endTime,
                createdAt: existingBooking.createdAt,
                age: Math.round((Date.now() - existingBooking.createdAt.getTime()) / (1000 * 60)) + ' minutes',
                isSameUser: existingBooking.userId.toString() === userId.toString()
            });

            // If it's the same user and it's a pending payment, delete the old one and continue
            if (existingBooking.userId.toString() === userId.toString() &&
                existingBooking.status === 'pending_payment') {
                console.log('Deleting old pending booking by same user:', existingBooking._id);
                await Booking.deleteOne({ _id: existingBooking._id });
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'This time slot is already booked or payment is pending',
                    existingBooking: {
                        id: existingBooking._id,
                        status: existingBooking.status,
                        startTime: existingBooking.startTime,
                        endTime: existingBooking.endTime,
                        isSameUser: existingBooking.userId.toString() === userId.toString()
                    }
                });
            }
        }

        // Calculate platform fee (let's say 10% platform commission)
        const platformFeePercentage = 0.10; // 10%
        const platformFee = Math.round(price * platformFeePercentage);
        const ownerEarnings = price - platformFee;

        // Create temporary booking with pending payment status
        const tempBooking = new Booking({
            userId,
            venueId,
            courtId,
            date: new Date(date),
            startTime,
            endTime,
            price,
            ownerId: venue.ownerId,
            ownerEarnings,
            platformFee,
            status: 'pending_payment',
            paymentStatus: 'pending'
        });

        await tempBooking.save();
        console.log('Temporary booking created:', tempBooking._id);

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Court Booking: ${court.name}`,
                            description: `${venue.name} - ${new Date(date).toLocaleDateString()} ${startTime}-${endTime}`,
                        },
                        unit_amount: Math.round(price * 100), // Convert to paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancelled`,
            metadata: {
                bookingId: tempBooking._id.toString(),
                userId: userId.toString(),
                venueId: venueId.toString(),
                courtId: courtId.toString(),
            },
        });

        // Update booking with session ID
        tempBooking.stripeSessionId = session.id;
        await tempBooking.save();

        console.log('Stripe session created:', session.id);

        res.status(200).json({
            success: true,
            sessionUrl: session.url,
            sessionId: session.id,
            bookingId: tempBooking._id
        });

    } catch (error) {
        console.error('Checkout session creation error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Handle Stripe webhook
// @route   POST /api/payments/webhook/stripe
// @access  Public (but verified)
export const webhookHandler = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        console.log('Webhook event received:', event.type);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                console.log('Payment successful for session:', session.id);

                // Find booking by session ID
                const booking = await Booking.findOne({ stripeSessionId: session.id });

                if (booking) {
                    // Update booking status to booked
                    booking.status = 'booked';
                    booking.paymentStatus = 'paid';
                    booking.stripePaymentIntentId = session.payment_intent;
                    await booking.save();

                    // Update venue earnings
                    await updateVenueEarnings(booking);

                    console.log('Booking confirmed and earnings updated:', booking._id);
                } else {
                    console.error('Booking not found for session:', session.id);
                }
                break;

            case 'checkout.session.expired':
            case 'payment_intent.payment_failed':
                const failedSession = event.data.object;
                console.log('Payment failed/expired for session:', failedSession.id);

                // Find booking by session ID
                const failedBooking = await Booking.findOne({
                    stripeSessionId: failedSession.id
                });

                if (failedBooking) {
                    // Delete failed/expired booking to free up the slot
                    await Booking.deleteOne({ _id: failedBooking._id });
                    console.log('Failed/expired booking deleted:', failedBooking._id);
                } else {
                    console.log('No booking found for failed/expired session:', failedSession.id);
                }
                break;

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        res.status(200).json({ received: true });
    } catch (error) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
};

// @desc    Get booking status by session ID
// @route   GET /api/payments/booking-status/:sessionId
// @access  Private
export const getBookingStatus = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const booking = await Booking.findOne({ stripeSessionId: sessionId })
            .populate('venueId', 'name address')
            .populate('userId', 'name email');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Get venue and court details
        const venue = await Venue.findById(booking.venueId);
        const court = venue ? venue.courts.id(booking.courtId) : null;

        res.status(200).json({
            success: true,
            booking: {
                ...booking.toObject(),
                court: court ? {
                    _id: court._id,
                    name: court.name,
                    sportType: court.sportType
                } : null
            }
        });

    } catch (error) {
        console.error('Get booking status error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Clean up expired pending bookings
// @route   POST /api/payments/cleanup-expired
// @access  Private
export const cleanupExpiredBookings = async (req, res) => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const result = await Booking.deleteMany({
            status: 'pending_payment',
            createdAt: { $lt: thirtyMinutesAgo }
        });

        res.status(200).json({
            success: true,
            message: `Cleaned up ${result.deletedCount} expired pending bookings`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Cleanup expired bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all pending bookings for debugging
// @route   GET /api/payments/debug-bookings
// @access  Private
export const getDebugBookings = async (req, res) => {
    try {
        const pendingBookings = await Booking.find({
            status: 'pending_payment'
        }).populate('userId', 'name email').populate('venueId', 'name');

        const allBookings = await Booking.find({}).populate('userId', 'name email').populate('venueId', 'name').sort({ createdAt: -1 }).limit(20);

        res.status(200).json({
            success: true,
            data: {
                pendingBookings: pendingBookings.map(b => ({
                    id: b._id,
                    userId: b.userId,
                    venueId: b.venueId,
                    courtId: b.courtId,
                    date: b.date,
                    startTime: b.startTime,
                    endTime: b.endTime,
                    status: b.status,
                    createdAt: b.createdAt,
                    age: Math.round((Date.now() - b.createdAt.getTime()) / (1000 * 60)) + ' minutes'
                })),
                recentBookings: allBookings.map(b => ({
                    id: b._id,
                    userId: b.userId,
                    venueId: b.venueId,
                    courtId: b.courtId,
                    date: b.date,
                    startTime: b.startTime,
                    endTime: b.endTime,
                    status: b.status,
                    createdAt: b.createdAt,
                    age: Math.round((Date.now() - b.createdAt.getTime()) / (1000 * 60)) + ' minutes'
                }))
            }
        });
    } catch (error) {
        console.error('Get debug bookings error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Helper function to update venue earnings
const updateVenueEarnings = async (booking) => {
    try {
        const existingEarnings = await VenueEarnings.findOne({
            venueId: booking.venueId,
            ownerId: booking.ownerId
        });

        if (existingEarnings) {
            // Update existing earnings
            existingEarnings.totalEarnings += booking.ownerEarnings;
            existingEarnings.pendingEarnings += booking.ownerEarnings;
            existingEarnings.totalBookings += 1;
            existingEarnings.lastBookingDate = new Date();
            await existingEarnings.save();
            console.log('Updated venue earnings:', existingEarnings);
        } else {
            // Create new earnings record
            const newEarnings = await VenueEarnings.create({
                venueId: booking.venueId,
                ownerId: booking.ownerId,
                totalEarnings: booking.ownerEarnings,
                pendingEarnings: booking.ownerEarnings,
                paidEarnings: 0,
                totalBookings: 1,
                lastBookingDate: new Date()
            });
            console.log('Created new venue earnings:', newEarnings);
        }

        // Also update the venue document with aggregated statistics
        await updateVenueStats(booking.venueId);
    } catch (error) {
        console.error('Error updating venue earnings:', error);
    }
};

// Helper function to update venue statistics
const updateVenueStats = async (venueId) => {
    try {
        // Get total bookings for this venue
        const totalBookings = await Booking.countDocuments({
            venueId,
            status: 'booked',
            paymentStatus: 'paid'
        });

        // Get total earnings for this venue
        const earningsData = await Booking.aggregate([
            {
                $match: {
                    venueId: venueId,
                    status: 'booked',
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    totalOwnerEarnings: { $sum: '$ownerEarnings' },
                    averageBookingValue: { $avg: '$price' }
                }
            }
        ]);

        const stats = earningsData[0] || {
            totalRevenue: 0,
            totalOwnerEarnings: 0,
            averageBookingValue: 0
        };

        // Get monthly bookings (this month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyBookings = await Booking.countDocuments({
            venueId,
            status: 'booked',
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
        });

        // Get monthly earnings
        const monthlyEarningsData = await Booking.aggregate([
            {
                $match: {
                    venueId: venueId,
                    status: 'booked',
                    paymentStatus: 'paid',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyEarnings: { $sum: '$ownerEarnings' }
                }
            }
        ]);

        const monthlyEarnings = monthlyEarningsData[0]?.monthlyEarnings || 0;

        // Update venue document with stats
        await Venue.findByIdAndUpdate(venueId, {
            $set: {
                totalBookings,
                monthlyBookings,
                monthlyEarnings: monthlyEarnings,
                totalRevenue: stats.totalRevenue,
                averageBookingValue: stats.averageBookingValue,
                lastUpdated: new Date()
            }
        });

        console.log('Updated venue stats:', {
            venueId,
            totalBookings,
            monthlyBookings,
            monthlyEarnings,
            totalRevenue: stats.totalRevenue
        });
    } catch (error) {
        console.error('Error updating venue stats:', error);
    }
};

// Helper function to clean up expired pending payments
const cleanupExpiredBookingsHelper = async () => {
    try {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const result = await Booking.deleteMany({
            status: 'pending_payment',
            createdAt: { $lt: thirtyMinutesAgo }
        });

        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} expired pending bookings`);
        }
    } catch (error) {
        console.error('Error cleaning up expired bookings:', error);
    }
};

// @desc    Get venue statistics in real-time
// @route   GET /api/payments/venue-stats/:venueId
// @access  Public
export const getVenueStats = async (req, res) => {
    try {
        const { venueId } = req.params;

        // Get venue basic info
        const venue = await Venue.findById(venueId);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Get real-time booking statistics
        const totalBookings = await Booking.countDocuments({
            venueId,
            status: 'booked',
            paymentStatus: 'paid'
        });

        // Get monthly statistics (current month)
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyBookings = await Booking.countDocuments({
            venueId,
            status: 'booked',
            paymentStatus: 'paid',
            createdAt: { $gte: startOfMonth }
        });

        // Get earnings data
        const earningsData = await Booking.aggregate([
            {
                $match: {
                    venueId: venue._id,
                    status: 'booked',
                    paymentStatus: 'paid'
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$price' },
                    totalOwnerEarnings: { $sum: '$ownerEarnings' },
                    totalPlatformFees: { $sum: '$platformFee' },
                    averageBookingValue: { $avg: '$price' }
                }
            }
        ]);

        // Get monthly earnings
        const monthlyEarningsData = await Booking.aggregate([
            {
                $match: {
                    venueId: venue._id,
                    status: 'booked',
                    paymentStatus: 'paid',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    monthlyRevenue: { $sum: '$price' },
                    monthlyOwnerEarnings: { $sum: '$ownerEarnings' },
                    monthlyPlatformFees: { $sum: '$platformFee' }
                }
            }
        ]);

        const totalStats = earningsData[0] || {
            totalRevenue: 0,
            totalOwnerEarnings: 0,
            totalPlatformFees: 0,
            averageBookingValue: 0
        };

        const monthlyStats = monthlyEarningsData[0] || {
            monthlyRevenue: 0,
            monthlyOwnerEarnings: 0,
            monthlyPlatformFees: 0
        };

        // Calculate occupancy rate (simplified - based on bookings vs available slots)
        const availableHoursPerDay = 12; // Assume 12 hours per day (8 AM to 8 PM)
        const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        const totalAvailableSlots = venue.courts.length * availableHoursPerDay * daysInMonth;
        const occupancyRate = totalAvailableSlots > 0 ? Math.round((monthlyBookings / totalAvailableSlots) * 100) : 0;

        // Get recent bookings
        const recentBookings = await Booking.find({
            venueId,
            status: 'booked',
            paymentStatus: 'paid'
        })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('date startTime endTime price ownerEarnings createdAt');

        res.status(200).json({
            success: true,
            data: {
                venue: {
                    id: venue._id,
                    name: venue.name,
                    totalCourts: venue.courts.length,
                    sportTypes: venue.sportTypes || []
                },
                statistics: {
                    totalBookings,
                    monthlyBookings,
                    occupancyRate,
                    ...totalStats,
                    ...monthlyStats
                },
                recentBookings
            }
        });

    } catch (error) {
        console.error('Get venue stats error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
