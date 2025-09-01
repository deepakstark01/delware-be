import User from '../models/User.js';
import { hash, compare } from '../utils/password.js';
import { createTokens, sanitizeUser } from '../services/auth.service.js';
import { verify } from '../utils/tokens.js';

// Updated pricing table to match frontend membership levels exactly
const PRICING_PLANS = {
  // Legacy plans for backward compatibility
  'basic': { priceCents: 2999, name: 'Basic Plan' },
  'premium': { priceCents: 4999, name: 'Premium Plan' },
  'pro': { priceCents: 9999, name: 'Pro Plan' },
  // Frontend membership levels (these are what the frontend is actually using)
  'College Student': { priceCents: 5000, name: 'College Student' },
  'Sole Entrepreneur': { priceCents: 20000, name: 'Sole Entrepreneur' },
  'Small Business': { priceCents: 35000, name: 'Small Business' },
  'Corporate': { priceCents: 75000, name: 'Corporate' },
  'Nonprofit/Government': { priceCents: 15000, name: 'Nonprofit/Government' },
  'Premier/Founders Circle': { priceCents: 200000, name: 'Premier/Founders Circle' }
};

// Mapping from frontend plan keys to display names
const PLAN_KEY_TO_DISPLAY = {
  'basic': 'College Student',
  'premium': 'Small Business', 
  'pro': 'Premier/Founders Circle'
};

export const register = async (req, res, next) => {
  try {
    console.log('Register request body:', JSON.stringify(req.body, null, 2));
    
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
      membershipPlan,
      selectedPlanTitle, // Frontend sends this
      paymentStatus
    } = req.body;

    // Validate required fields
    if (!password) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Password is required',
        details: 'Password field cannot be empty'
      });
    }

    if (!membershipPlan && !selectedPlanTitle) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Membership plan is required',
        details: 'Please select a membership plan'
      });
    }

    // Determine the plan to use - prefer selectedPlanTitle (from frontend) over membershipPlan
    let planKey = selectedPlanTitle || membershipPlan;
    
    // If planKey is one of the backend mapping values, convert it to display name
    if (PLAN_KEY_TO_DISPLAY[planKey]) {
      planKey = PLAN_KEY_TO_DISPLAY[planKey];
    }

    // Validate plan exists
    const planDetails = PRICING_PLANS[planKey];
    if (!planDetails) {
      console.log(`Invalid plan key: ${planKey}`);
      console.log('Available plans:', Object.keys(PRICING_PLANS));
      return res.status(400).json({
        code: 'INVALID_PLAN',
        message: 'Invalid membership plan',
        details: `Plan '${planKey}' not found. Available plans: ${Object.keys(PRICING_PLANS).join(', ')}`
      });
    }

    console.log(`Using plan: ${planKey}`, planDetails);

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        code: 'USER_EXISTS',
        message: 'User already exists',
        details: 'An account with this email already exists'
      });
    }

    // Hash the password
    const passwordHash = await hash(password);

    // Determine membership status based on payment status
    const membershipStatus = paymentStatus === 'paid' ? 'active' : 'pending';
    
    // Set membership dates if payment is completed
    const membershipStartAt = paymentStatus === 'paid' ? new Date() : null;
    let membershipEndAt = null;
    
    if (paymentStatus === 'paid') {
      membershipEndAt = new Date();
      membershipEndAt.setFullYear(membershipEndAt.getFullYear() + 1); // 1 year membership
    }

    // Create user with the correct plan key
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
      role: 'member', // Default role for new registrations
      membershipPlan: planKey, // Use the validated plan key
      membershipStatus,
      membershipStartAt,
      membershipEndAt,
      paymentStatus: paymentStatus || 'pending' // Default to pending if not provided
    });

    console.log('Creating user with data:', {
      email: user.email,
      membershipPlan: user.membershipPlan,
      paymentStatus: user.paymentStatus,
      membershipStatus: user.membershipStatus
    });

    await user.save();

    // Create tokens for authentication
    const tokens = createTokens(user);
    const sanitizedUser = sanitizeUser(user);

    res.status(201).json({
      user: sanitizedUser,
      ...tokens,
      message: paymentStatus === 'paid' 
        ? 'Registration successful. Your membership is now active!'
        : 'Registration successful. Please complete payment to activate your membership.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const isValidPassword = await compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid credentials',
        details: 'Email or password is incorrect'
      });
    }

    const tokens = createTokens(user);
    const sanitizedUser = sanitizeUser(user);

    res.json({
      user: sanitizedUser,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        code: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token required',
        details: 'Refresh token is required for token renewal'
      });
    }

    const decoded = verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refresh_secret');
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        code: 'INVALID_REFRESH_TOKEN',
        message: 'Invalid refresh token',
        details: 'User not found'
      });
    }

    const tokens = createTokens(user);
    const sanitizedUser = sanitizeUser(user);

    res.json({
      user: sanitizedUser,
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // In a production app, you might want to blacklist the tokens
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const updatePaymentStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
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
      userId,
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

export const me = async (req, res, next) => {
  try {
    const sanitizedUser = sanitizeUser(req.user);
    res.json({ user: sanitizedUser });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const allowedUpdates = ['firstName', 'lastName', 'phone', 'address', 'city', 'state', 'zip'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    const sanitizedUser = sanitizeUser(user);
    res.json({ user: sanitizedUser });
  } catch (error) {
    next(error);
  }
};