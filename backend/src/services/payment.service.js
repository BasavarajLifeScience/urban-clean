const crypto = require('crypto');
const razorpayInstance = require('../config/razorpay');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const { generateInvoiceNumber } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Create Razorpay order
 */
const createOrder = async (bookingId, amount, userId) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId: bookingId.toString(),
        userId: userId.toString(),
      },
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      userId,
      amount,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      status: 'created',
    });

    return {
      orderId: payment._id,
      razorpayOrderId: razorpayOrder.id,
      amount,
      currency: 'INR',
    };
  } catch (error) {
    logger.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 */
const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    // Generate signature
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    // Verify signature
    if (expectedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature');
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId },
      {
        razorpayPaymentId,
        razorpaySignature,
        status: 'success',
      },
      { new: true }
    );

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update booking
    const booking = await Booking.findByIdAndUpdate(
      payment.bookingId,
      {
        paymentStatus: 'paid',
        paymentId: payment._id,
        paymentMethod: 'Razorpay',
        paidAt: new Date(),
      },
      { new: true }
    );

    // Generate invoice
    const invoice = await generateInvoice(booking, payment);

    return {
      payment,
      booking,
      invoice,
    };
  } catch (error) {
    logger.error('Error verifying payment:', error);
    // Update payment status to failed
    await Payment.findOneAndUpdate(
      { razorpayOrderId },
      { status: 'failed', failureReason: error.message }
    );
    throw error;
  }
};

/**
 * Generate invoice
 */
const generateInvoice = async (booking, payment) => {
  try {
    const invoiceNumber = generateInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      bookingId: booking._id,
      paymentId: payment._id,
      userId: booking.residentId,
      items: [
        {
          description: 'Service Booking',
          quantity: 1,
          rate: booking.basePrice,
          amount: booking.basePrice,
        },
      ],
      subtotal: booking.basePrice,
      tax: 0,
      discount: booking.discount || 0,
      total: booking.totalAmount,
      issuedAt: new Date(),
      paidAt: payment.createdAt,
    });

    return invoice;
  } catch (error) {
    logger.error('Error generating invoice:', error);
    throw error;
  }
};

/**
 * Process refund
 */
const processRefund = async (bookingId, amount, reason) => {
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    const payment = await Payment.findById(booking.paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'success') {
      throw new Error('Cannot refund unsuccessful payment');
    }

    // Create Razorpay refund
    const refund = await razorpayInstance.payments.refund(payment.razorpayPaymentId, {
      amount: Math.round(amount * 100), // amount in paise
      notes: {
        reason,
        bookingId: bookingId.toString(),
      },
    });

    // Update payment
    payment.status = 'refunded';
    payment.refundId = refund.id;
    payment.refundAmount = amount;
    payment.refundStatus = 'processed';
    payment.refundedAt = new Date();
    await payment.save();

    // Update booking
    booking.paymentStatus = 'refunded';
    booking.refundAmount = amount;
    booking.refundStatus = 'processed';
    await booking.save();

    return {
      payment,
      booking,
      refund,
    };
  } catch (error) {
    logger.error('Error processing refund:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  generateInvoice,
  processRefund,
};
