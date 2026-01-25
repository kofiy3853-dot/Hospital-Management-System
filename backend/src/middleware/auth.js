const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { ROLES, hasPermission } = require('../config/roles');

// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } 
        // Get token from cookies if not in header
        else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Not authorized, no token provided' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Get user from the token
            const user = await User.findByPk(decoded.id, {
                attributes: { exclude: ['password'] },
                raw: true
            });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(401).json({
                    success: false,
                    message: 'User account is disabled'
                });
            }

            // Attach user to request object
            req.user = user;
            next();
        } catch (error) {
            console.error('JWT Error:', error.message);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed',
                error: error.message
            });
        }
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }

        next();
    };
};

// Permission-based authorization middleware
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!hasPermission(req.user.role, permission)) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action'
            });
        }

        next();
    };
};

// Specific role middlewares for convenience
const requireSuperAdmin = [authenticate, authorize(ROLES.SUPER_ADMIN)];
const requireAdmin = [authenticate, authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN)];
const requireDoctor = [authenticate, authorize(ROLES.DOCTOR)];
const requireNurse = [authenticate, authorize(ROLES.NURSE)];
const requirePharmacist = [authenticate, authorize(ROLES.PHARMACIST)];
const requireLabTech = [authenticate, authorize(ROLES.LAB_TECH)];
const requireReceptionist = [authenticate, authorize(ROLES.RECEPTIONIST)];
const requireAccountant = [authenticate, authorize(ROLES.ACCOUNTANT)];
const requirePatient = [authenticate, authorize(ROLES.PATIENT)];
const requireStaff = [authenticate, authorize([
    ROLES.ADMIN, 
    ROLES.DOCTOR, 
    ROLES.NURSE, 
    ROLES.PHARMACIST, 
    ROLES.LAB_TECH, 
    ROLES.RECEPTIONIST, 
    ROLES.ACCOUNTANT
])];

module.exports = {
    authenticate,
    authorize,
    checkPermission,
    requireSuperAdmin,
    requireAdmin,
    requireDoctor,
    requireNurse,
    requirePharmacist,
    requireLabTech,
    requireReceptionist,
    requireAccountant,
    requirePatient,
    requireStaff
};
