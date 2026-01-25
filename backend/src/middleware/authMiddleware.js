const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] }
            });

            if (!req.user) {
                console.error(`[AUTH] 401: User ${decoded.id} not found in database`);
                return res.status(401).json({ message: 'User not found' });
            }

            return next();
        } catch (error) {
            console.error('[AUTH] 401 Failure:', error.name === 'TokenExpiredError' ? 'TOKEN EXPIRED' : error.message);
            return res.status(401).json({ 
                message: error.name === 'TokenExpiredError' ? 'Your session has expired. Please log in again.' : 'Not authorized, token failed',
                expired: error.name === 'TokenExpiredError'
            });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user.role} is not authorized to access this route` 
            });
        }
        next();
    };
};

// Specific role middlewares for convenience
const admin = (req, res, next) => authorize('admin')(req, res, next);
const doctor = (req, res, next) => authorize('doctor')(req, res, next);
const nurse = (req, res, next) => authorize('nurse')(req, res, next);
const staff = (req, res, next) => authorize('doctor', 'nurse')(req, res, next);

module.exports = { 
    protect, 
    authorize, 
    admin, 
    doctor, 
    nurse, 
    staff 
};
