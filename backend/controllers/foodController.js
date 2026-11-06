const Food = require('../models/Food');

// @desc    Get all foods (search, category, veg filters)
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const { search, category, restaurant, isVeg } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    const foods = await Food.find(query).populate('restaurant', 'name rating deliveryTime deliveryFee');
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const food = await Food.findById(req.params.id).populate('restaurant', 'name rating deliveryTime deliveryFee');
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    next(error);
  }
};

// @desc    Get foods by restaurant ID
// @route   GET /api/restaurants/:id/foods
// @access  Public
const getFoodsByRestaurant = async (req, res, next) => {
  try {
    const foods = await Food.find({ restaurant: req.params.id });
    res.json({ success: true, count: foods.length, data: foods });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFoods, getFoodById, getFoodsByRestaurant };
