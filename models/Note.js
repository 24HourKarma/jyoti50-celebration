const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    displayLocation: {
        type: String,
        default: 'Home Page'
    }
});

module.exports = mongoose.model('Note', NoteSchema);
