const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const { calculateDistanceAndRoute } = require('../services/mapsService');
const { assignDeliveryPartner } = require('../services/deliveryService');
const { sendOrderNotification } = require('../services/notificationService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res, next) => {
  try {
    const { deliveryAddress, paymentMethod = 'card' } = req.body;

    // Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.food');

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty' });
    }

    const restaurant = await Restaurant.findById(cart.restaurant);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const orderItems = cart.items.map((item) => ({
      food: item.food._id,
      name: item.food.name,
      price: item.price,
      quantity: item.quantity,
      image: item.food.image,
    }));

    const subtotal = +orderItems
      .reduce((acc, item) => acc + item.price * item.quantity, 0)
      .toFixed(2);
    const deliveryFee = restaurant.deliveryFee || 2.99;
    const tax = +(subtotal * 0.08).toFixed(2); // 8% sales tax
    const totalAmount = +(subtotal + deliveryFee + tax).toFixed(2);

    const userAddress = deliveryAddress || req.user.address || {
      street: '123 Main St, Apt 4B',
      city: 'San Francisco',
      zipCode: '94105',
      phone: req.user.phone || '+1 555-0199',
    };

    // Calculate simulated route & assign delivery rider
    const routeInfo = calculateDistanceAndRoute(restaurant.address?.coordinates, userAddress);
    const deliveryPartner = assignDeliveryPartner(null, restaurant.address?.coordinates);

    const order = await Order.create({
      user: req.user._id,
      restaurant: restaurant._id,
      items: orderItems,
      subtotal,
      deliveryFee,
      tax,
      totalAmount,
      deliveryAddress: userAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      deliveryPartner,
      estimatedDeliveryTime: routeInfo.durationText,
      statusTimeline: [
        {
          status: 'placed',
          timestamp: new Date(),
          message: 'Order received and sent to kitchen',
        },
      ],
    });

    // Clear user's cart
    cart.items = [];
    cart.restaurant = null;
    await cart.save();

    // Trigger external notification
    await sendOrderNotification({
      type: 'email',
      recipient: req.user.email,
      orderId: order._id,
      status: 'Placed',
      details: { totalAmount, itemsCount: orderItems.length },
    });

    const populatedOrder = await Order.findById(order._id).populate('restaurant', 'name image address');
    res.status(201).json({ success: true, data: populatedOrder });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('restaurant', 'name image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('restaurant', 'name image address phone rating');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Ensure only the owner or an admin can access this order
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this order' });
    }

    if (['out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order when status is '${order.status}'`,
      });
    }

    order.status = 'cancelled';
    order.statusTimeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      message: 'Order was cancelled by customer',
    });

    await order.save();

    await sendOrderNotification({
      type: 'sms',
      recipient: req.user.phone || req.user.email,
      orderId: order._id,
      status: 'Cancelled',
      details: { refundStatus: 'Initiated' },
    });

    res.json({ success: true, message: 'Order successfully cancelled', data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};
