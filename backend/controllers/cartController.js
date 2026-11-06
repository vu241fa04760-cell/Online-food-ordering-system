const Cart = require('../models/Cart');
const Food = require('../models/Food');

// @desc    Get user's active cart
// @route   GET /api/cart
// @access  Private
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.food')
      .populate('restaurant', 'name deliveryFee');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private
const addItemToCart = async (req, res, next) => {
  try {
    const { foodId, quantity = 1 } = req.body;

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        restaurant: food.restaurant,
        items: [],
      });
    }

    // Check if food belongs to the same restaurant or reset cart
    if (cart.restaurant && cart.restaurant.toString() !== food.restaurant.toString() && cart.items.length > 0) {
      // Clear previous restaurant items if adding from new restaurant
      cart.restaurant = food.restaurant;
      cart.items = [];
    } else if (!cart.restaurant) {
      cart.restaurant = food.restaurant;
    }

    const existingIndex = cart.items.findIndex(
      (item) => item.food.toString() === foodId.toString()
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        food: foodId,
        quantity: Number(quantity),
        price: food.price,
      });
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.food').populate('restaurant', 'name deliveryFee');

    res.status(201).json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:id
// @access  Private
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId || item.food.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1);
      if (cart.items.length === 0) {
        cart.restaurant = null;
      }
    } else {
      cart.items[itemIndex].quantity = Number(quantity);
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.food').populate('restaurant', 'name deliveryFee');

    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item from cart or clear cart
// @route   DELETE /api/cart/items/:id
// @access  Private
const deleteCartItem = async (req, res, next) => {
  try {
    const itemId = req.params.id;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    if (itemId === 'clear' || itemId === 'all') {
      cart.items = [];
      cart.restaurant = null;
    } else {
      cart.items = cart.items.filter(
        (item) => item._id.toString() !== itemId && item.food.toString() !== itemId
      );
      if (cart.items.length === 0) {
        cart.restaurant = null;
      }
    }

    await cart.save();
    cart = await Cart.findById(cart._id).populate('items.food').populate('restaurant', 'name deliveryFee');

    res.json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
};
