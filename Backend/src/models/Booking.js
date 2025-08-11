import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: [true, 'Venue ID is required']
    },
    courtId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Court ID is required']
    },
    date: {
        type: Date,
        required: [true, 'Booking date is required']
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format']
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be positive']
    },
    status: {
        type: String,
        enum: ['booked', 'cancelled', 'completed'],
        default: 'booked'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ venueId: 1, courtId: 1, date: 1 });
bookingSchema.index({ status: 1 });

// Method to check for time overlap
bookingSchema.statics.checkTimeOverlap = function (startTime1, endTime1, startTime2, endTime2) {
    const start1 = this.timeToMinutes(startTime1);
    const end1 = this.timeToMinutes(endTime1);
    const start2 = this.timeToMinutes(startTime2);
    const end2 = this.timeToMinutes(endTime2);

    return start1 < end2 && start2 < end1;
};

// Helper method to convert time string to minutes
bookingSchema.statics.timeToMinutes = function (timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
