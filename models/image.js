var mongoose = require('mongoose');
var random = require('mongoose-simple-random');

var ImageSchema = new mongoose.Schema({
    uri: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    },
    isTrash: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

ImageSchema.plugin(random);

var Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
