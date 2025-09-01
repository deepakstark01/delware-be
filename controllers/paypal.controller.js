import PendingRegistration from '../models/PendingRegistration.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { createOrder, verifyWebhook } from '../services/paypal.service.js';
import { hash } from '../utils/password.js';
import { sendWelcomeEmail } from '../utils/email.js';

export const createPayPalOrder = async (req, res, next) => {
  try {
    const { pendingRegistrationId } = req.body;

    const pending = await PendingRegistration.findById(pendingRegistrationId);
    if (!pending) {
      return res.status(404).json({
        code: 'PENDING_NOT_FOUND',
        message: 'Pending registration not found',
        details: 'Invalid pendingRegistrationId'
      });
    }

    if (pending.paymentStatus === 'completed') {
      return res.status(400).json({
        code: 'ALREADY_COMPLETED',
        message: 'Payment already completed',
        details: 'This registration has already been processed'
      });
    }

    const order = await createOrder(pending);
    
    // Update pending registration with PayPal order ID
    pending.paypalOrderId = order.id;
    pending.paymentStatus = 'pending';
    await pending.save();

    res.json({
      id: order.id,
      approveUrl: order.approveUrl,
      status: order.status
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req, res, next) => {
  try {
    const headers = req.headers;
    const rawBody = req.rawBody;

    // Verify webhook signature
    const isValid = await verifyWebhook(headers, rawBody);
    if (!isValid) {
      return res.status(401).json({
        code: 'INVALID_WEBHOOK',
        message: 'Webhook verification failed',
        details: 'Invalid webhook signature'
      });
    }

    const event = JSON.parse(rawBody.toString());

    // Handle PAYMENT.CAPTURE.COMPLETED event
    if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const capture = event.resource;
      const orderId = capture.supplementary_data?.related_ids?.order_id;
      const captureId = capture.id;
      const amountCents = Math.round(parseFloat(capture.amount.value) * 100);
      const currency = capture.amount.currency_code;

      // Find pending registration by PayPal order ID
      const pending = await PendingRegistration.findOne({ paypalOrderId: orderId });
      if (!pending) {
        console.warn(`Pending registration not found for order: ${orderId}`);
        return res.status(200).send('OK');
      }

      // Verify amount and currency
      if (amountCents !== pending.priceCents || currency !== pending.currency) {
        console.error(`Amount mismatch: expected ${pending.priceCents} ${pending.currency}, got ${amountCents} ${currency}`);
        return res.status(400).json({
          code: 'AMOUNT_MISMATCH',
          message: 'Payment amount mismatch',
          details: 'Payment amount does not match expected amount'
        });
      }

      // Check for idempotency - prevent duplicate processing
      const existingPayment = await Payment.findOne({ captureId });
      if (existingPayment) {
        console.log(`Payment already processed: ${captureId}`);
        return res.status(200).send('OK');
      }

      // Create payment record
      const payment = new Payment({
        userId: pending.userId,
        pendingRegistrationId: pending._id,
        orderId,
        captureId,
        status: capture.status,
        amountCents,
        currency,
        raw: event
      });

      await payment.save();

      // Check if user already exists
      let user = await User.findOne({ email: pending.email });
      
      if (!user) {
        // Create new user
        const tempPassword = Math.random().toString(36).slice(-12);
        const passwordHash = await hash(tempPassword);

        user = new User({
          email: pending.email,
          passwordHash,
          firstName: pending.firstName,
          lastName: pending.lastName,
          phone: pending.phone,
          address: pending.address,
          city: pending.city,
          state: pending.state,
          zip: pending.zip,
          membershipPlan: pending.selectedPlan,
          membershipStatus: 'active',
          membershipStartAt: new Date(),
          membershipEndAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // +1 year
        });

        await user.save();

        // Update payment with user ID
        payment.userId = user._id;
        await payment.save();

        // Send welcome email with temporary password
        try {
          await sendWelcomeEmail(user, tempPassword);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
      } else {
        // Update existing user's membership
        user.membershipPlan = pending.selectedPlan;
        user.membershipStatus = 'active';
        user.membershipStartAt = new Date();
        user.membershipEndAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await user.save();

        payment.userId = user._id;
        await payment.save();
      }

      // Update pending registration
      pending.paymentStatus = 'completed';
      pending.userId = user._id;
      await pending.save();

      console.log(`Payment completed for user: ${user.email}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    next(error);
  }
};
