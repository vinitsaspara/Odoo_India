import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory structure
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
const venuesDir = path.join(uploadsDir, 'venues');
const usersDir = path.join(uploadsDir, 'users');

// Ensure directories exist
[uploadsDir, venuesDir, usersDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Storage configuration for venue images
const venueStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, venuesDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomnumber-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `venue-${uniqueSuffix}-${baseName}${extension}`);
    }
});

// Storage configuration for user avatars
const userStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, usersDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomnumber-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `user-${uniqueSuffix}-${baseName}${extension}`);
    }
});

// File filter for images
const imageFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// Multer configuration for venue images
export const uploadVenueImages = multer({
    storage: venueStorage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
    },
    fileFilter: imageFilter
}).fields([
    { name: "coverImage", maxCount: 1 },
    { name: "images", maxCount: 10 },
]);

// Multer configuration for user avatar
export const uploadUserAvatar = multer({
    storage: userStorage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
    },
    fileFilter: imageFilter
}).single("avatar");

// Helper function to generate file URL
export const generateFileUrl = (filename, type = 'venues') => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Helper function to get file path
export const getFilePath = (filename, type = 'venues') => {
    return path.join(uploadsDir, type, filename);
};

console.log("Local file upload system configured successfully");
console.log(`Uploads directory: ${uploadsDir}`);