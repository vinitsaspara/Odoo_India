import mongoose from 'mongoose';

const venueSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    name: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    location: {
        lat: {
            type: Number,
            required: [true, 'Latitude is required']
        },
        lng: {
            type: Number,
            required: [true, 'Longitude is required']
        }
    },
    sports: [{
        type: String,
        trim: true
    }],
    amenities: [{
        type: String,
        trim: true
    }],
    photos: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
