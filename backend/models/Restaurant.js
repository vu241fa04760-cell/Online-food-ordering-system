const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    cuisine: {
      type: [String],
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 120,
    },
    deliveryTime: {
      type: String,
      default: '25-35 min',
    },
    deliveryFee: {
      type: Number,
      default: 2.99,
    },
    minOrder: {
      type: Number,
      default: 10,
    },
    address: {
      street: String,
      city: String,
      coordinates: {
        lat: { type: Number, default: 37.7749 },
        lng: { type: Number, default: -122.4194 },
      },
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Restaurant', restaurantSchema);
