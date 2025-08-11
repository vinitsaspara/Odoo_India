import Venue from '../models/Venue.js';
import { uploadVenueImages, generateFileUrl, deleteFile, getFilePath } from '../config/cloudinary.js';

// Export the upload middleware from cloudinary config
export { uploadVenueImages } from '../config/cloudinary.js';

// @desc    Create a new venue
// @route   POST /api/venues
// @access  Private (Owner only)
export const createVenue = async (req, res) => {
    try {
        const venueData = JSON.parse(req.body.venueData);

        // Validate required fields
        const requiredFields = ['name', 'description', 'address', 'city', 'state', 'pincode',
            'contactName', 'phone', 'email', 'sportTypes', 'totalCourts',
            'courts', 'cancellationPolicy'];

        for (const field of requiredFields) {
            if (!venueData[field]) {
                return res.status(400).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }

        // Validate courts
        if (!Array.isArray(venueData.courts) || venueData.courts.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one court is required'
            });
        }

        // Validate sport types
        if (!Array.isArray(venueData.sportTypes) || venueData.sportTypes.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one sport type is required'
            });
        }

        // Process uploaded images from local storage
        const images = [];
        let coverImage = null;

        if (req.files) {
            console.log('Processing uploaded files...');

            // Process cover image
            if (req.files.coverImage && req.files.coverImage[0]) {
                const file = req.files.coverImage[0];
                console.log('Cover image uploaded:', file.filename);
                coverImage = {
                    filename: file.filename,
                    url: generateFileUrl(file.filename, 'venues'),
                    originalName: file.originalname
                };
            }

            // Process additional images
            if (req.files.images) {
                req.files.images.forEach(file => {
                    console.log('Additional image uploaded:', file.filename);
                    images.push({
                        filename: file.filename,
                        url: generateFileUrl(file.filename, 'venues'),
                        originalName: file.originalname
                    });
                });
            }
        }

        // Create venue
        const venue = await Venue.create({
            ownerId: req.user._id,
            name: venueData.name.trim(),
            description: venueData.description.trim(),
            address: venueData.address.trim(),
            city: venueData.city.trim(),
            state: venueData.state.trim(),
            pincode: venueData.pincode.trim(),
            latitude: venueData.latitude ? parseFloat(venueData.latitude) : undefined,
            longitude: venueData.longitude ? parseFloat(venueData.longitude) : undefined,
            contactName: venueData.contactName.trim(),
            phone: venueData.phone.trim(),
            email: venueData.email.trim(),
            website: venueData.website ? venueData.website.trim() : undefined,
            sportTypes: venueData.sportTypes,
            totalCourts: venueData.totalCourts,
            courts: venueData.courts,
            amenities: venueData.amenities || [],
            operatingHours: venueData.operatingHours,
            cancellationPolicy: venueData.cancellationPolicy.trim(),
            rules: venueData.rules ? venueData.rules.trim() : undefined,
            images: images,
            coverImage: coverImage,
            status: 'Pending Approval'
        });

        await venue.populate('ownerId', 'name email');

        console.log('Venue created successfully:', {
            venueId: venue._id,
            name: venue.name,
            coverImage: coverImage?.url,
            imagesCount: images.length
        });

        res.status(201).json({
            success: true,
            message: 'Venue submitted successfully for admin review',
            venue
        });
    } catch (error) {
        console.error('Create venue error:', error);
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
            state,
            minRating,
            maxPrice,
            minPrice,
            search,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = {};

        // Only show approved venues for public access
        if (!ownerId) {
            filter.status = 'Active';
        } else if (status && status !== 'All') {
            // For owners, only apply status filter if explicitly provided
            filter.status = status;
        }

        // Filter by sport
        if (sport && sport !== 'All Sports') {
            filter.sportTypes = { $in: [sport] };
        }

        // Filter by owner
        if (ownerId) {
            filter.ownerId = ownerId;
        }

        // Filter by location
        if (city) {
            filter.city = { $regex: city, $options: 'i' };
        }
        if (state) {
            filter.state = { $regex: state, $options: 'i' };
        }

        // Filter by minimum rating
        if (minRating) {
            filter.rating = { $gte: parseFloat(minRating) };
        }

        // Filter by price range (using minimum court price)
        if (minPrice || maxPrice) {
            const priceFilter = {};
            if (minPrice) priceFilter.$gte = parseFloat(minPrice);
            if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
            filter['courts.pricePerHour'] = priceFilter;
        }

        // Search in name, description, address
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { address: { $regex: search, $options: 'i' } }
            ];
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
        console.error('Get venues error:', error);
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
        const venue = await Venue.findById(id).populate('ownerId', 'name email');

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
        console.error('Get venue by ID error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update venue
// @route   PUT /api/venues/:id
// @access  Private (Owner only)
export const updateVenue = async (req, res) => {
    try {
        const { id } = req.params;

        // Find venue and verify ownership
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if user owns this venue
        if (venue.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only update your own venues'
            });
        }

        const venueData = req.body.venueData ? JSON.parse(req.body.venueData) : req.body;

        // Process uploaded images if any
        const updateData = { ...venueData };

        if (req.files) {
            console.log('Processing updated files...');

            // Process new cover image
            if (req.files.coverImage && req.files.coverImage[0]) {
                // Delete old cover image from local storage if exists
                if (venue.coverImage && venue.coverImage.filename) {
                    const oldCoverPath = getFilePath(venue.coverImage.filename, 'venues');
                    deleteFile(oldCoverPath);
                }

                const file = req.files.coverImage[0];
                console.log('New cover image uploaded:', file.filename);
                updateData.coverImage = {
                    filename: file.filename,
                    url: generateFileUrl(file.filename, 'venues'),
                    originalName: file.originalname
                };
            }

            // Process new additional images
            if (req.files.images && req.files.images.length > 0) {
                const newImages = req.files.images.map(file => {
                    console.log('New additional image uploaded:', file.filename);
                    return {
                        filename: file.filename,
                        url: generateFileUrl(file.filename, 'venues'),
                        originalName: file.originalname
                    };
                });
                // Append new images to existing ones
                updateData.images = [...(venue.images || []), ...newImages];
            }
        }

        // If venue was rejected and being resubmitted, reset status and admin comments
        if (venue.status === 'Rejected') {
            updateData.status = 'Pending Approval';
            updateData.adminComments = undefined;
            updateData.rejectedAt = undefined;
            updateData.submittedAt = new Date();
        }

        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ownerId', 'name email');

        console.log('Venue updated successfully:', {
            venueId: updatedVenue._id,
            name: updatedVenue.name,
            coverImage: updatedVenue.coverImage?.url,
            imagesCount: updatedVenue.images?.length || 0
        });

        res.status(200).json({
            success: true,
            message: 'Venue updated successfully',
            venue: updatedVenue
        });
    } catch (error) {
        console.error('Update venue error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete venue
// @route   DELETE /api/venues/:id
// @access  Private (Owner only)
export const deleteVenue = async (req, res) => {
    try {
        const { id } = req.params;

        // Find venue and verify ownership
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if user owns this venue
        if (venue.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own venues'
            });
        }

        // Delete images from local storage
        try {
            // Delete cover image
            if (venue.coverImage && venue.coverImage.filename) {
                const coverPath = getFilePath(venue.coverImage.filename, 'venues');
                deleteFile(coverPath);
            }

            // Delete additional images
            if (venue.images && venue.images.length > 0) {
                for (const image of venue.images) {
                    if (image.filename) {
                        const imagePath = getFilePath(image.filename, 'venues');
                        deleteFile(imagePath);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting images from local storage:', error);
            // Continue with venue deletion even if image deletion fails
        }

        await Venue.findByIdAndDelete(id);

        console.log('Venue deleted successfully:', {
            venueId: id,
            name: venue.name
        });

        res.status(200).json({
            success: true,
            message: 'Venue deleted successfully'
        });
    } catch (error) {
        console.error('Delete venue error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Delete image from venue
// @route   DELETE /api/venues/:id/images/:imageId
// @access  Private (Owner only)
export const deleteVenueImage = async (req, res) => {
    try {
        const { id, imageId } = req.params;
        const { imageType } = req.query; // 'cover' or 'gallery'

        // Find venue and verify ownership
        const venue = await Venue.findById(id);
        if (!venue) {
            return res.status(404).json({
                success: false,
                message: 'Venue not found'
            });
        }

        // Check if user owns this venue
        if (venue.ownerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only modify your own venues'
            });
        }

        let imageToDelete = null;
        let updateData = {};

        if (imageType === 'cover') {
            if (venue.coverImage && venue.coverImage.filename === imageId) {
                imageToDelete = venue.coverImage;
                updateData.coverImage = undefined;
            }
        } else {
            // Find the image in gallery
            const imageIndex = venue.images.findIndex(img => img.filename === imageId);
            if (imageIndex !== -1) {
                imageToDelete = venue.images[imageIndex];
                updateData.images = venue.images.filter(img => img.filename !== imageId);
            }
        }

        if (!imageToDelete) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        // Delete image from local storage
        try {
            const imagePath = getFilePath(imageToDelete.filename, 'venues');
            const deleted = deleteFile(imagePath);
            if (!deleted) {
                console.warn('File not found on disk:', imagePath);
            }
        } catch (error) {
            console.error('Error deleting image from local storage:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete image from storage'
            });
        }

        // Update venue in database
        const updatedVenue = await Venue.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('ownerId', 'name email');

        console.log('Image deleted successfully:', {
            venueId: id,
            imageType: imageType,
            filename: imageToDelete.filename
        });

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            venue: updatedVenue
        });
    } catch (error) {
        console.error('Delete venue image error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
