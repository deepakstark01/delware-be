import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pendingRegistrationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PendingRegistration'
  },
  provider: {
    type: String,
    default: 'paypal'
  },
  orderId: {
    type: String,
    required: true
  },
  captureId: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    required: true
  },
  amountCents: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  raw: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Indexes for performance
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ userId: 1 });

export default mongoose.model('Payment', paymentSchema);
