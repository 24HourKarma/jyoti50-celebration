const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GallerySchema = new Schema({
    path: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'Gallery Image'
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Gallery', GallerySchema);
