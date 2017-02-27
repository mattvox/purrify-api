var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var config = require('./config');
var jwtConfig = require('./jwt-config');

var User = require('./models/user');
// var Fact = require('./models/fact');

var adminRoutes = require('./routes/admin-routes');
var guestRoutes = require('./routes/guest-routes');

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());
server.use(express.static("public"));

var runServer = function (callback) {
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
            console.error(err, 'mehGithub');
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
    User.findOne({email: req.body.email}, '+password', function (err, user) {
        if (err) {
            return res.status(404).json({message: "User Not Found"});
        }

        user.validatePassword(req.body.password, function (err, isValid) {
            console.log(err, isValid);
            if (err) {
                return res.status(418).json({message: 'Im a teapot'});
            }

            if (!isValid) {
                return res.json({message: 'Invalid password'});
            }

            console.log(user);

            // this is where we generate a token
            var token = jwt.sign({
                email: user.email
            }, jwtConfig.jwtSecret, {expiresIn: '8h'});

            res.status(200).json({
                token: token
            });
        })
    });
})

// CATCH-ALL

server.use('*', function (req, res) {
  res.status(404).json({message: '404: Not Found'});
})

// ********** MIDDLEWARE **********

// server.use(function(req, res, next){
//
//   console.log(req.headers);
//
//   var token = req.query.token || req.body.token || req.params.token || req.headers['x-access-token'] || req.headers.authorization;
//
//   var splitToken = token.split(' ');
//
//   if (splitToken.length === 2) {
//       var bearer = splitToken[0];
//       var jwtToken = splitToken[1];
//       if (/^Bearer$/i.test(bearer)) {
//         token = jwtToken;
//       }
//   }
//
//   console.log('token', token);
//
//   jwt.verify(token, jwtConfig.jwtSecret, function (err, decoded) {
//       console.log(decoded);
//       if (err){
//         return res.status(403).json({
//           message: 'failed to authenticate'
//         })
//       }
//       // the usual error checking
//       req.decoded = decoded
//       next();
//   })
// })
