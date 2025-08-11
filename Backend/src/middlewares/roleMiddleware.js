// Middleware to check if user has required role(s)
export const requireRoles = (allowedRoles) => {
    return (req, res, next) => {
        // Check if user exists on request (should be set by auth middleware)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        // Check if user has a role
        if (!req.user.role) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. No role assigned to user.'
            });
        }

        // Check if user's role is in the allowed roles array
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
            });
        }

        // User has required role, proceed
        next();
    };
};

// Convenience middleware for common role combinations
export const requireAdmin = requireRoles(['admin']);
export const requireOwner = requireRoles(['owner']);
export const requireAdminOrOwner = requireRoles(['admin', 'owner']);
export const requireAnyRole = requireRoles(['user', 'owner', 'admin']);

export default {
    requireRoles,
    requireAdmin,
    requireOwner,
    requireAdminOrOwner,
    requireAnyRole
};
