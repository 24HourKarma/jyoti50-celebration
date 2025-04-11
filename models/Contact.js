const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: ''
    },
    description: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
