const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
    siteTitle: {
        type: String,
        required: true,
        default: 'Jyoti\'s 50th Birthday Celebration'
    },
    eventDate: {
        type: String,
        required: true,
        default: 'April 24-27, 2025'
    },
    eventLocation: {
        type: String,
        required: true,
        default: 'Kraków, Poland'
    },
    primaryColor: {
        type: String,
        required: true,
        default: '#d4af37'
    },
    secondaryColor: {
        type: String,
        required: true,
        default: '#121212'
    }
});

module.exports = mongoose.model('Settings', SettingsSchema);
