import express from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Logout
router.post('/logout', authenticateToken, AuthController.logout);

// Refresh token
router.post('/refresh', AuthController.refreshToken);

// Verify email
router.get('/verify/:token', AuthController.verifyEmail);

// Forgot password
router.post('/forgot-password', AuthController.forgotPassword);

// Reset password
router.post('/reset-password/:token', AuthController.resetPassword);

// Get current user
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// Update password
router.put('/password', authenticateToken, AuthController.updatePassword);

export default router;
