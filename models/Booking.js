import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  numberOfTickets: {
    type: Number,
    default: 1
  },
  attendeeDetails: [{
    name: String,
    email: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Booking', bookingSchema);
