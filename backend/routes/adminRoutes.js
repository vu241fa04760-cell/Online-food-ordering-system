const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createRestaurant,
  createFood,
  updateOrderStatus,
  getAllOrders,
  getAdminStats,
} = require('../controllers/adminController');
const { protect, authorizeAdmin } = require('../middleware/auth');

router.use(protect);
router.use(authorizeAdmin);

router.get('/users', getAllUsers);
router.post('/restaurants', createRestaurant);
router.post('/foods', createFood);
router.put('/orders/:id', updateOrderStatus);
router.get('/orders', getAllOrders);
router.get('/stats', getAdminStats);

module.exports = router;
