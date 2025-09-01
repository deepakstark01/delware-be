import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verify } from '../utils/tokens.js';

// Renamed from requireAuth to authenticate to match import in routes
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Access token required',
        details: 'Authorization header with Bearer token is required'
      });
    }

    const decoded = verify(token, process.env.JWT_ACCESS_SECRET || 'access_secret');
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Invalid token',
        details: 'User not found'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Invalid token',
      details: error.message
    });
  }
};

export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        details: 'User must be authenticated'
      });
    }
    
    if (req.user.role !== role) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        details: `Role ${role} required`
      });
    }
    
    next();
  };
};