const express = require('express');
const router = express.Router();
const {
  getCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:id', updateCartItem);
router.delete('/items/:id', deleteCartItem);

module.exports = router;
