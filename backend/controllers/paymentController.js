const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { processGatewayPayment } = require('../services/paymentService');

// @desc    Process payment for an order
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res, next) => {
  try {
    const { orderId, paymentMethod = 'card', cardDetails, upiId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to pay for this order' });
    }

    // Call simulated external payment gateway
    const gatewayResult = await processGatewayPayment({
      orderId: order._id,
      amount: order.totalAmount,
      paymentMethod,
      cardDetails,
      upiId,
    });

    const payment = await Payment.create({
      order: order._id,
      user: req.user._id,
      amount: order.totalAmount,
      paymentMethod,
      transactionId: gatewayResult.transactionId,
      status: gatewayResult.status === 'success' ? 'success' : 'pending',
      gatewayResponse: gatewayResult,
    });

    // Update order status if payment succeeded
    if (gatewayResult.status === 'success') {
      order.paymentStatus = 'completed';
      order.paymentMethod = paymentMethod;
      await order.save();
    }

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment receipt/status by ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('order')
      .populate('user', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this payment' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, getPaymentById };
