const mongoose = require('mongoose');
const schema=mongoose.Schema;
const { v4 : uuidv4 } = require("uuid");

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: uuidv4(),
    unique: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  shippingAddress: {
    name: String,
    houseNumber: String,
    city: String,
    state: String,
    pin: Number,
    phone: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending','delivered', 'cancel','Returned'],
    default: 'pending'
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;