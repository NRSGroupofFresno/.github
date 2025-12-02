import bcrypt from 'bcrypt';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../middleware/auth.js';

export class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { email, password, username, userType = 'viewer' } = req.body;

            // Validate input
            if (!email || !password || !username) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['email', 'password', 'username']
                });
            }

            // Check password strength
            if (password.length < 8) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters long'
                });
            }

            // TODO: Check if user already exists in database

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // TODO: Save user to database
            const user = {
                user_id: `user_${Date.now()}`,
                email,
                username,
                userType,
                password: hashedPassword,
                email_verified: false,
                created_at: new Date().toISOString()
            };

            // Generate tokens
            const token = generateToken({
                userId: user.user_id,
                email: user.email,
                userType: user.userType
            });

            const refreshToken = generateRefreshToken({
                userId: user.user_id
            });

            res.status(201).json({
                success: true,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    username: user.username,
                    userType: user.userType
                },
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                error: 'Registration failed',
                message: error.message
            });
        }
    }

    // Login
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate input
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required'
                });
            }

            // TODO: Find user in database
            const user = {
                user_id: 'user_123',
                email,
                username: 'testuser',
                userType: 'performer',
                password: await bcrypt.hash(password, 10) // Mock
            };

            if (!user) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({
                    error: 'Invalid credentials'
                });
            }

            // Generate tokens
            const token = generateToken({
                userId: user.user_id,
                email: user.email,
                userType: user.userType,
                performerId: user.performer_id
            });

            const refreshToken = generateRefreshToken({
                userId: user.user_id
            });

            res.json({
                success: true,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    username: user.username,
                    userType: user.userType
                },
                token,
                refreshToken
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                error: 'Login failed',
                message: error.message
            });
        }
    }

    // Logout
    static async logout(req, res) {
        try {
            // TODO: Invalidate refresh token in database
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                error: 'Logout failed',
                message: error.message
            });
        }
    }

    // Refresh token
    static async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    error: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = verifyRefreshToken(refreshToken);

            // TODO: Check if refresh token is still valid in database

            // Generate new access token
            const token = generateToken({
                userId: decoded.userId,
                email: decoded.email,
                userType: decoded.userType
            });

            res.json({
                success: true,
                token
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({
                error: 'Invalid refresh token',
                message: error.message
            });
        }
    }

    // Verify email
    static async verifyEmail(req, res) {
        try {
            const { token } = req.params;

            // TODO: Verify token and update user in database

            res.json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            console.error('Verify email error:', error);
            res.status(500).json({
                error: 'Email verification failed',
                message: error.message
            });
        }
    }

    // Forgot password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            // TODO: Find user and send password reset email

            res.json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                error: 'Password reset request failed',
                message: error.message
            });
        }
    }

    // Reset password
    static async resetPassword(req, res) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            if (password.length < 8) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters long'
                });
            }

            // TODO: Verify token and update password

            res.json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                error: 'Password reset failed',
                message: error.message
            });
        }
    }

    // Get current user
    static async getCurrentUser(req, res) {
        try {
            const userId = req.user.userId;

            // TODO: Fetch user from database
            const user = {
                user_id: userId,
                email: 'user@example.com',
                username: 'testuser',
                userType: req.user.userType
            };

            res.json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                error: 'Failed to get user',
                message: error.message
            });
        }
    }

    // Update password
    static async updatePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (newPassword.length < 8) {
                return res.status(400).json({
                    error: 'Password must be at least 8 characters long'
                });
            }

            // TODO: Verify current password and update

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            console.error('Update password error:', error);
            res.status(500).json({
                error: 'Password update failed',
                message: error.message
            });
        }
    }
}
