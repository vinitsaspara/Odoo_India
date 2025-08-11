import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
    venueId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venue',
        required: [true, 'Venue ID is required']
    },
    name: {
        type: String,
        required: [true, 'Court name is required'],
        trim: true
    },
    sportType: {
        type: String,
        required: [true, 'Sport type is required'],
        trim: true
    },
    pricePerHour: {
        type: Number,
        required: [true, 'Price per hour is required'],
        min: 0
    },
    operatingHours: {
        open: {
            type: String,
            required: [true, 'Opening time is required']
        },
        close: {
            type: String,
            required: [true, 'Closing time is required']
        }
    },
    slotDuration: {
        type: Number,
        required: [true, 'Slot duration is required'],
        min: 15 // minimum 15 minutes
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Court = mongoose.model('Court', courtSchema);

export default Court;
