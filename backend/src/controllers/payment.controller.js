const { createOrder, verifyPayment, processRefund } = require('../services/payment.service');
const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const { sendSuccess } = require('../utils/response.utils');
const { NotFoundError } = require('../utils/errors');
const { getPagination } = require('../utils/helpers');
const { notifyPaymentSuccess, notifyPaymentFailed } = require('../services/notification.service');

/**
 * Create payment order
 */
const createPaymentOrder = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookingId, amount } = req.body;

    const order = await createOrder(bookingId, amount, userId);

    return sendSuccess(res, 200, 'Payment order created successfully', order);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify payment
 */
const verifyPaymentController = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const result = await verifyPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    // Send notification
    await notifyPaymentSuccess(result.payment, userId);

    return sendSuccess(res, 200, 'Payment verified successfully', result);
  } catch (error) {
    // Send failure notification
    const userId = req.user.userId;
    await notifyPaymentFailed({ amount: req.body.amount }, userId);

    next(error);
  }
};

/**
 * Get invoice
 */
const getInvoice = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const invoice = await Invoice.findOne({ bookingId, userId })
      .populate('bookingId')
      .populate('paymentId');

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return sendSuccess(res, 200, 'Invoice retrieved successfully', { invoice });
  } catch (error) {
    next(error);
  }
};

/**
 * Get payment history
 */
const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const payments = await Payment.find({ userId, status: 'success' })
      .populate('bookingId', 'bookingNumber scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Payment.countDocuments({ userId, status: 'success' });

    return sendSuccess(res, 200, 'Payment history retrieved successfully', {
      payments,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund
 */
const refundPayment = async (req, res, next) => {
  try {
    const { bookingId, amount, reason } = req.body;

    const result = await processRefund(bookingId, amount, reason);

    return sendSuccess(res, 200, 'Refund processed successfully', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPaymentController,
  getInvoice,
  getPaymentHistory,
  refundPayment,
};
