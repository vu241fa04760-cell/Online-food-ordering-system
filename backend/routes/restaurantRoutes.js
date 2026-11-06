const express = require('express');
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
} = require('../controllers/restaurantController');
const { getFoodsByRestaurant } = require('../controllers/foodController');

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);
router.get('/:id/foods', getFoodsByRestaurant);

module.exports = router;
