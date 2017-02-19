var mongoose = require('mongoose');
var random = require('mongoose-simple-random');

var FactSchema = new mongoose.Schema({
    fact: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

FactSchema.plugin(random);

var Fact = mongoose.model('Fact', FactSchema);

module.exports = Fact;
