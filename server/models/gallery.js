const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  url: { type: String, required: true },
  caption: { type: String },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Gallery', gallerySchema);
