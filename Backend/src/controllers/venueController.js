import Venue from '../models/Venue.js';

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (Owner only)
export const createVenue = async (req, res) => {
    try {
        const { name, address, location, sports, amenities, photos } = req.body;

        // Validate required fields
        if (!name || !address || !location || !location.lat || !location.lng) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, address, and location (lat, lng)'
            });
        }

        // Validate location coordinates
        if (typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            return res.status(400).json({
                success: false,
                message: 'Location coordinates must be valid numbers'
            });
        }

        if (location.lat < -90 || location.lat > 90) {
            return res.status(400).json({
                success: false,
                message: 'Latitude must be between -90 and 90'
            });
        }

        if (location.lng < -180 || location.lng > 180) {
            return res.status(400).json({
                success: false,
                message: 'Longitude must be between -180 and 180'
            });
        }

        // Create venue with owner ID from authenticated user
        const venue = await Venue.create({
            ownerId: req.user._id,
            name: name.trim(),
            address: address.trim(),
            location: {
                lat: location.lat,
                lng: location.lng
            },
            sports: sports || [],
            amenities: amenities || [],
            photos: photos || []
        });

        res.status(201).json({
            success: true,
            message: 'Venue created successfully',
            venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get all venues with filters
// @route   GET /api/venues
// @access  Public
export const getVenues = async (req, res) => {
    try {
        const {
            sport,
            status,
            ownerId,
            city,
            minRating,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Filter by sport
        if (sport) {
            filter.sports = { $in: [sport] };
        }

        // Filter by status
        if (status) {
            filter.status = status;
        }

        // Filter by owner
        if (ownerId) {
            filter.ownerId = ownerId;
        }

        // Filter by city (case-insensitive search in address)
        if (city) {
            filter.address = { $regex: city, $options: 'i' };
        }

        // Filter by minimum rating
        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }

        // Calculate pagination
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;

        // Build sort object
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with filters, pagination, and sorting
        const venues = await Venue.find(filter)
            .populate('ownerId', 'name email')
            .sort(sort)
            .skip(skip)
            .limit(pageSize);

        // Get total count for pagination
        const totalVenues = await Venue.countDocuments(filter);
        const totalPages = Math.ceil(totalVenues / pageSize);

        res.status(200).json({
            success: true,
            venues,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalVenues,
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

// @desc    Get venue by ID
// @route   GET /api/venues/:id
// @access  Public
export const getVenueById = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ObjectId format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid venue ID format'
            });
        }

        // Find venue by ID and populate owner details
        const venue = await Venue.findById(id).populate('ownerId', 'name email avatarUrl');

        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        res.status(200).json({
            success: true,
            venue
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
