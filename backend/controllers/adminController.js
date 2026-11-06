const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const { sendOrderNotification } = require('../services/notificationService');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new restaurant
// @route   POST /api/admin/restaurants
// @access  Private/Admin
const createRestaurant = async (req, res, next) => {
  try {
    const { name, description, cuisine, image, rating, deliveryTime, deliveryFee, address } = req.body;

    const restaurant = await Restaurant.create({
      name,
      description,
      cuisine: Array.isArray(cuisine) ? cuisine : cuisine.split(',').map((c) => c.trim()),
      image: image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=60',
      rating: rating ? Number(rating) : 4.5,
      deliveryTime: deliveryTime || '30-40 min',
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : 2.99,
      address: address || { street: '100 Gourmet Way', city: 'Metropolis' },
    });

    res.status(201).json({ success: true, message: 'Restaurant created successfully', data: restaurant });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a food item to a restaurant
// @route   POST /api/admin/foods
// @access  Private/Admin
const createFood = async (req, res, next) => {
  try {
    const { name, description, price, category, image, restaurant, isVeg, calories } = req.body;

    const restaurantExists = await Restaurant.findById(restaurant);
    if (!restaurantExists) {
      return res.status(404).json({ success: false, message: 'Specified restaurant does not exist' });
    }

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category: category || 'Main Course',
      image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=60',
      restaurant,
      isVeg: isVeg !== undefined ? isVeg : true,
      calories: calories ? Number(calories) : 400,
    });

    res.status(201).json({ success: true, message: 'Food item created successfully', data: food });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
// @access  Private/Admin
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    order.status = status;
    const statusMessages = {
      confirmed: 'Order has been confirmed by the restaurant',
      preparing: 'Chef is preparing your delicious meal',
      out_for_delivery: 'Rider is on the way with your food',
      delivered: 'Order delivered safely. Enjoy your meal!',
      cancelled: 'Order was cancelled',
    };

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      message: note || statusMessages[status] || `Status updated to ${status}`,
    });

    // Move rider coordinates closer when out for delivery or delivered
    if (status === 'out_for_delivery' && order.deliveryPartner) {
      order.deliveryPartner.currentLocation.lat += 0.005;
      order.deliveryPartner.currentLocation.lng += 0.005;
    }

    await order.save();

    // Trigger external notification
    if (order.user) {
      await sendOrderNotification({
        type: 'email',
        recipient: order.user.email,
        orderId: order._id,
        status: status.replace('_', ' ').toUpperCase(),
        details: { note: statusMessages[status] },
      });
    }

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('restaurant', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalFoods = await Food.countDocuments();
    const orders = await Order.find();

    const totalOrders = orders.length;
    const totalRevenue = +orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((acc, o) => acc + (o.totalAmount || 0), 0)
      .toFixed(2);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRestaurants,
        totalFoods,
        totalOrders,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createRestaurant,
  createFood,
  updateOrderStatus,
  getAllOrders,
  getAdminStats,
};
