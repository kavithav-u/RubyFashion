// models/banner.js
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, required: true }, // New field for the banner title
  description: { type: String, required: true }, // New field for the banner description
});

module.exports = mongoose.model('Banner', bannerSchema);
