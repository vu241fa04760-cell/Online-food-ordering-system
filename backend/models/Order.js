const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 2.99 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      zipCode: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod', 'netbanking'],
      default: 'card',
    },
    deliveryPartner: {
      name: { type: String, default: 'Alex Morgan' },
      phone: { type: String, default: '+1 (555) 234-5678' },
      vehicle: { type: String, default: 'Electric Scooter (EV-902)' },
      rating: { type: Number, default: 4.9 },
      currentLocation: {
        lat: { type: Number, default: 37.7749 },
        lng: { type: Number, default: -122.4194 },
      },
    },
    estimatedDeliveryTime: { type: String, default: '30-40 min' },
    statusTimeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        message: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
