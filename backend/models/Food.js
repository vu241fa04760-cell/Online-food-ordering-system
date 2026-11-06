const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Appetizers', 'Main Course', 'Pizza & Pasta', 'Burgers & Wraps', 'Biryani & Rice', 'Desserts', 'Beverages', 'Sides'],
    },
    image: {
      type: String,
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.6,
    },
    calories: {
      type: Number,
      default: 450,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Food', foodSchema);
