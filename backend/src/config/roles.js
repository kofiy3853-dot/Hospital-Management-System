// Define all available roles
const ROLES = {
    SUPER_ADMIN: 'super_admin',
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    PHARMACIST: 'pharmacist',
    LAB_TECH: 'lab_tech',
    RECEPTIONIST: 'receptionist',
    ACCOUNTANT: 'accountant',
    PATIENT: 'patient'
};

// Define permissions for each role
const ROLE_PERMISSIONS = {
    [ROLES.SUPER_ADMIN]: [
        'manage:all',
        'manage:branches',
        'manage:departments',
        'manage:staff',
        'view:reports',
        'access:admin_dashboard'
    ],
    [ROLES.ADMIN]: [
        'manage:staff',
        'view:reports',
        'access:admin_dashboard'
    ],
    [ROLES.DOCTOR]: [
        'diagnose:patients',
        'prescribe:medication',
        'request:lab_tests',
        'view:patient_records',
        'access:doctor_dashboard'
    ],
    [ROLES.NURSE]: [
        'record:vital_signs',
        'monitor:patients',
        'update:patient_status',
        'access:nurse_dashboard'
    ],
    [ROLES.PHARMACIST]: [
        'dispense:medication',
        'manage:inventory',
        'view:prescriptions',
        'access:pharmacy_dashboard'
    ],
    [ROLES.LAB_TECH]: [
        'manage:lab_tests',
        'update:test_results',
        'view:lab_requests',
        'access:lab_dashboard'
    ],
    [ROLES.RECEPTIONIST]: [
        'register:patients',
        'book:appointments',
        'update:patient_info',
        'access:reception_dashboard'
    ],
    [ROLES.ACCOUNTANT]: [
        'manage:billing',
        'process:payments',
        'generate:financial_reports',
        'access:accounting_dashboard'
    ],
    [ROLES.PATIENT]: [
        'view:own_records',
        'book:own_appointments',
        'view:billing',
        'access:patient_portal'
    ]
};

// Function to check if a role has a specific permission
const hasPermission = (role, permission) => {
    // Super admin has all permissions
    if (role === ROLES.SUPER_ADMIN) return true;
    
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes('manage:all') || permissions.includes(permission);
};

// Middleware to check permissions
const checkPermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (hasPermission(req.user.role, permission)) {
            return next();
        }

        res.status(403).json({ 
            message: 'You do not have permission to perform this action' 
        });
    };
};

module.exports = {
    ROLES,
    ROLE_PERMISSIONS,
    hasPermission,
    checkPermission
};
