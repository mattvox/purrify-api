var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    permissions: {
        type: String,
        required: true,
        default: 'admin'
    }
}, {
    timestamps: {
        createdAt: 'created_at'
    }
});

UserSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, function(err, isValid) {
        if (err) {
            callback(err);

            return;
        }
        callback(null, isValid);
    })
}

var User = mongoose.model('User', UserSchema);

module.exports = User;
