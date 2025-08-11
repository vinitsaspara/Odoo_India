import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadUserAvatar } from '../config/cloudinary.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user with optional avatar
// @access  Public
router.post('/register', uploadUserAvatar, registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   GET /api/auth/profile
router.get('/profile', verifyToken, getUserProfile);

export default router;
