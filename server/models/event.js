const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  day: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String },
  endTime: { type: String },
  location: { type: String },
  description: { type: String },
  dressCode: { type: String },
  mapUrl: { type: String },
  websiteUrl: { type: String },
  notes: { type: String }
});

module.exports = mongoose.model('Event', eventSchema);
