import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  zip: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  },
  membershipPlan: {
  type: String,
  required: true,
  enum: [
    // Legacy plans
    'basic', 
    'premium', 
    'pro',
    // New membership levels
    'College Student',
    'Sole Entrepreneur', 
    'Small Business',
    'Corporate',
    'Nonprofit/Government',
    'Premier/Founders Circle'
  ],
  default: 'basic'
},
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  membershipStatus: {
    type: String,
    enum: ['active', 'expired', 'pending', 'canceled'],
    default: 'pending'
  },
  membershipStartAt: {
    type: Date
  },
  membershipEndAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ membershipStatus: 1 });
userSchema.index({ paymentStatus: 1 });

export default mongoose.model('User', userSchema);