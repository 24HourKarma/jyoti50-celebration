const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    dressCode: {
        type: String,
        default: ''
    },
    notes: {
        type: String,
        default: ''
    },
    day: {
        type: String,
        required: true
    },
    mapUrl: {
        type: String,
        default: ''
    },
    websiteUrl: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Event', EventSchema);
