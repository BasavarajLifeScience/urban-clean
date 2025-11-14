const { ForbiddenError, UnauthorizedError } = require('../utils/errors');
const Admin = require('../models/Admin');

/**
 * Check if user is admin
 */
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if admin has specific permission
 */
const hasPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        throw new ForbiddenError('Admin access required');
      }

      // Get admin details with permissions
      const admin = await Admin.findOne({ userId: req.user.userId });

      if (!admin) {
        throw new ForbiddenError('Admin profile not found');
      }

      // Super admin has all permissions
      if (admin.isSuperAdmin) {
        req.admin = admin;
        return next();
      }

      // Parse required permission (format: "module:action")
      const [reqModule, reqAction] = requiredPermission.split(':');

      // Check if admin has the required permission
      const hasAccess = admin.permissions.some(permission => {
        const moduleMatch = permission.module === reqModule || permission.module === '*';
        const actionMatch = permission.actions.includes(reqAction) || permission.actions.includes('*');
        return moduleMatch && actionMatch;
      });

      if (!hasAccess) {
        throw new ForbiddenError(`Insufficient permissions: ${requiredPermission} required`);
      }

      // Attach admin details to request
      req.admin = admin;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is super admin
 */
const isSuperAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    const admin = await Admin.findOne({ userId: req.user.userId });

    if (!admin || !admin.isSuperAdmin) {
      throw new ForbiddenError('Super admin access required');
    }

    req.admin = admin;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  isAdmin,
  hasPermission,
  isSuperAdmin,
};
