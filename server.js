/* global process */

var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

/*eslint-disable*/
if (process.env.NODE_ENV !== 'production'){
    var jwtConfig = require('./jwt-config');
}
/*eslint-disable*/

var config = require('./config');
var User = require('./models/user');

var adminRoutes = require('./routes/admin-routes');
var guestRoutes = require('./routes/guest-routes');

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
server.use(express.static("public"));

var runServer = function (callback) {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.DATABASE_URL, function (err) {
        if (err && callback) {
            return callback(err);
        }

        server.listen(config.PORT, function () {
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) {
    runServer(function (err) {
        if (err) {
            console.error(err, 'Server not started');
        }
    });
}

// API TEST route
server.get('/api', function (req, res) {
    // res.json({message: "It worked, it worked!!!"});
    res.redirect('/');
});


// ********** GUEST ROUTES **********

server.use('/api', guestRoutes);

// ********** ADMIN ROUTES **********

server.use('/admin', adminRoutes);

// ********** LOGIN ROUTE **********

server.post('/login', function (req, res) {
    User.findOne({ email: req.body.email }, '+password', function (err, user) {
        if (err) {
            return res.status(404).json({message: "User Not Found"});
        }

        if (!user) {
            return res.status(418).json({message: "User Not Found"});
        }

        user.validatePassword(req.body.password, function (err, isValid) {
            if (err) {
                return res.status(418).json({message: 'Im a teapot'});
            }

            if (!isValid) {
                return res.status(404).json({message: 'Invalid password'});
            }

            var token = jwt.sign({
                email: user.email,
                permissions: user.permissions
            }, jwtConfig.jwtSecret || process.env.JWT_SECRET, {expiresIn: '8h'});

            res.status(200).json({
                token: token
            });
        })
    });
})

// ********** CATCH-ALL ROUTE **********

server.use('*', function (req, res) {
  res.status(404).json({message: '404: Not Found'});
})
