const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');

// @desc    Get all restaurants (with filters & search)
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = async (req, res, next) => {
  try {
    const { search, cuisine, rating, sort } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (cuisine) {
      query.cuisine = { $in: [new RegExp(cuisine, 'i')] };
    }

    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    let result = Restaurant.find(query);

    if (sort === 'rating') {
      result = result.sort({ rating: -1 });
    } else if (sort === 'deliveryFee') {
      result = result.sort({ deliveryFee: 1 });
    } else {
      result = result.sort({ createdAt: -1 });
    }

    const restaurants = await result;
    res.json({ success: true, count: restaurants.length, data: restaurants });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    const foods = await Food.find({ restaurant: req.params.id });
    res.json({
      success: true,
      data: {
        ...restaurant.toObject(),
        foods,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRestaurants, getRestaurantById };
