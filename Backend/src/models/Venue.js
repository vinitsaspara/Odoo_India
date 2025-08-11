import mongoose from 'mongoose';

const courtSchema = new mongoose.Schema({
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
        min: [0, 'Price must be positive']
    },
    dimensions: {
        type: String,
        trim: true
    },
    surface: {
        type: String,
        trim: true
    },
    isIndoor: {
        type: Boolean,
        default: true
    }
});

const operatingHoursSchema = new mongoose.Schema({
    monday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    tuesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    wednesday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    thursday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    friday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    saturday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    },
    sunday: {
        isOpen: { type: Boolean, default: true },
        openTime: { type: String, default: "06:00" },
        closeTime: { type: String, default: "22:00" }
    }
});

const venueSchema = new mongoose.Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },

    // Basic Information
    name: {
        type: String,
        required: [true, 'Venue name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },

    // Location
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
    },
    pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },

    // Contact Information
    contactName: {
        type: String,
        required: [true, 'Contact name is required'],
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true
    },
    website: {
        type: String,
        trim: true
    },

    // Venue Details
    sportTypes: [{
        type: String,
        required: true,
        trim: true
    }],
    totalCourts: {
        type: Number,
        required: [true, 'Total courts is required'],
        min: [1, 'Must have at least 1 court']
    },
    courts: [courtSchema],

    // Amenities
    amenities: [{
        type: String,
        trim: true
    }],

    // Operating Hours
    operatingHours: {
        type: operatingHoursSchema,
        default: () => ({})
    },

    // Policies
    cancellationPolicy: {
        type: String,
        required: [true, 'Cancellation policy is required'],
        trim: true
    },
    rules: {
        type: String,
        trim: true
    },

    // Images (Cloudinary)
    images: [{
        publicId: String,
        url: String,
        originalName: String
    }],
    coverImage: {
        publicId: String,
        url: String,
        originalName: String
    },

    // Status and Reviews
    status: {
        type: String,
        enum: ['Pending Approval', 'Active', 'Rejected', 'Under Maintenance'],
        default: 'Pending Approval'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalReviews: {
        type: Number,
        default: 0
    },

    // Admin Review
    adminComments: {
        type: String,
        trim: true
    },
    approvedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for location-based queries
venueSchema.index({ latitude: 1, longitude: 1 });
venueSchema.index({ city: 1, state: 1 });
venueSchema.index({ sportTypes: 1 });
venueSchema.index({ status: 1 });
venueSchema.index({ ownerId: 1 });

const Venue = mongoose.model('Venue', venueSchema);

export default Venue;
