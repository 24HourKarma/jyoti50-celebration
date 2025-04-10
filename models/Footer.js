const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FooterSchema = new Schema({
    title: {
        type: String,
        required: true,
        default: 'Jyoti\'s 50th Birthday Celebration'
    },
    text: {
        type: String,
        required: true,
        default: 'Join us for a memorable celebration in Kraków, Poland!'
    },
    copyright: {
        type: String,
        required: true,
        default: '© 2025 Jyoti\'s 50th Birthday'
    }
});

module.exports = mongoose.model('Footer', FooterSchema);
