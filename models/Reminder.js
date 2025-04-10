const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReminderSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        default: 'Bell'
    }
});

module.exports = mongoose.model('Reminder', ReminderSchema);
