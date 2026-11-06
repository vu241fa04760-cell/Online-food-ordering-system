const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'cod', 'netbanking'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
