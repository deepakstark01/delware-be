import mongoose from 'mongoose';

const pendingRegistrationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
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
  selectedPlan: {
    type: String,
    required: true,
    // Update this to include all your plan types
    enum: [
      'basic', 'premium', 'pro',
      'College Student', 'Sole Entrepreneur', 'Small Business', 
      'Corporate', 'Nonprofit/Government', 'Premier/Founders Circle'
    ],
    trim: true
  },
  priceCents: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  paymentStatus: {
    type: String,
    enum: ['initiated', 'processing', 'completed', 'failed'],
    default: 'initiated'
  },
  paymentId: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Add expiry after 24 hours
pendingRegistrationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model('PendingRegistration', pendingRegistrationSchema);