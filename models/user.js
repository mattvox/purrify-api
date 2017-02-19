var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    }
});

var User = mongoose.model('User', UserSchema);

module.exports = User;

// Notes

// admin permissions?
// -
// -
// -

// check for unique user name?
