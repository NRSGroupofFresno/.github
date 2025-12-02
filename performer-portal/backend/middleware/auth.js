import jwt from 'jsonwebtoken';

// Authenticate JWT token
export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'No token provided'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or expired token'
        });
    }
}

// Check if user is a performer
export function isPerformer(req, res, next) {
    if (req.user.userType !== 'performer') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This action requires performer privileges'
        });
    }
    next();
}

// Check if user is an admin
export function isAdmin(req, res, next) {
    if (req.user.userType !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This action requires admin privileges'
        });
    }
    next();
}

// Optional authentication (doesn't fail if no token)
export function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            req.user = decoded;
        } catch (error) {
            // Token invalid, but continue without user
            req.user = null;
        }
    } else {
        req.user = null;
    }

    next();
}

// Generate JWT token
export function generateToken(payload, expiresIn = '7d') {
    return jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn
    });
}

// Generate refresh token
export function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret', {
        expiresIn: '30d'
    });
}

// Verify refresh token
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret');
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
}
