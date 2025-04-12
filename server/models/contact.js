const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String },
  phone: { type: String },
  email: { type: String },
  type: { type: String },
  notes: { type: String }
});

module.exports = mongoose.model('Contact', contactSchema);
