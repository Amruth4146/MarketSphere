import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, config.jwt.secret);

      // Verify user existence in database - never rely on unverified claims
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists or session has expired',
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact support.',
        });
      }

      // Populate verified user to request
      req.user = user;
      return next();
    } catch (error) {
      const isExpired = error.name === 'TokenExpiredError';
      return res.status(401).json({
        success: false,
        message: isExpired
          ? 'Access token expired. Please refresh your session.'
          : 'Invalid authentication token',
      });
    }
  }

  return res.status(401).json({
    success: false,
    message: 'Authentication required. No Bearer token provided.',
  });
};

/**
 * Role-Based Access Control (RBAC)
 * Strictly verifies against the authenticated database user record (req.user.role)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
