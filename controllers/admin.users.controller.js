import User from '../models/User.js';
import { hash } from '../utils/password.js';
import { sanitizeUser } from '../services/auth.service.js';
import { sendPasswordResetEmail } from '../utils/email.js';

export const listUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (req.query.role) {
      query.role = req.query.role;
    }
    if (req.query.membershipStatus) {
      query.membershipStatus = req.query.membershipStatus;
    }
    if (req.query.paymentStatus) {
      query.paymentStatus = req.query.paymentStatus;
    }
    if (req.query.search) {
      query.$or = [
        { email: { $regex: req.query.search, $options: 'i' } },
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => sanitizeUser(user)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      address, 
      city, 
      state, 
      zip, 
      role, 
      membershipPlan, 
      membershipStatus,
      paymentStatus 
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        code: 'USER_EXISTS',
        message: 'User already exists',
        details: 'An account with this email already exists'
      });
    }

    const passwordHash = await hash(password);

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      zip,
      role: role || 'member',
      membershipPlan,
      membershipStatus: membershipStatus || 'pending',
      paymentStatus: paymentStatus || 'pending'
    });

    await user.save();

    res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zip',
      'role', 'membershipPlan', 'membershipStatus', 'membershipStartAt', 'membershipEndAt',
      'paymentStatus', 'paymentId'
    ];
    
    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // If payment status is being updated to 'paid', also update membership status to 'active'
    if (updates.paymentStatus === 'paid' && !updates.membershipStatus) {
      updates.membershipStatus = 'active';
      
      // Set membership start date to today if not provided
      if (!updates.membershipStartAt) {
        updates.membershipStartAt = new Date();
      }
      
      // Set membership end date to 1 year from start date if not provided
      if (!updates.membershipEndAt) {
        const startDate = updates.membershipStartAt || new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year membership
        updates.membershipEndAt = endDate;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    
    const updates = {
      paymentStatus,
      paymentId
    };
    
    // If payment is now paid, update membership status
    if (paymentStatus === 'paid') {
      updates.membershipStatus = 'active';
      updates.membershipStartAt = new Date();
      
      // Set end date 1 year from now
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      updates.membershipEndAt = endDate;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    res.json({ 
      user: sanitizeUser(user),
      message: paymentStatus === 'paid' 
        ? 'Payment completed successfully. Membership is now active.' 
        : 'Payment status updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const passwordHash = await hash(password);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { passwordHash },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(user, 'Password has been reset by admin');
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

export const expireUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 
        membershipStatus: 'expired',
        membershipEndAt: new Date()
      },
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
        details: 'User with specified ID does not exist'
      });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};