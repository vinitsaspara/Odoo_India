import mongoose from 'mongoose';

const venueEarningsSchema = new mongoose.Schema({
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: [true, 'Venue ID is required']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    pendingEarnings: {
        type: Number,
        default: 0
    },
    paidEarnings: {
        type: Number,
        default: 0
    },
    totalBookings: {
        type: Number,
        default: 0
    },
    lastBookingDate: {
        type: Date,
        required: false
    },
    lastPayoutDate: {
        type: Date,
        required: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
venueEarningsSchema.index({ venueId: 1, ownerId: 1 }, { unique: true });
venueEarningsSchema.index({ ownerId: 1 });

// Update the updatedAt field before saving
venueEarningsSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const VenueEarnings = mongoose.model('VenueEarnings', venueEarningsSchema);

export default VenueEarnings;
