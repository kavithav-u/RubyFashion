const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    default: uuidv4().split("-")[0].toUpperCase(),
    unique: true,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validUntil: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Offer = mongoose.model("Offer", offerSchema);

module.exports = {
  Coupon,
  Offer,
};
