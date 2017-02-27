var adminRouter = require('express').Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var jwtConfig = require('../jwt-config');

var User = require('../models/user');
var Fact = require('../models/fact');

// ********** MIDDLEWARE **********

adminRouter.use(function(req, res, next){

  console.log(req.headers);

  var token = req.query.token || req.body.token || req.params.token || req.headers['x-access-token'] || req.headers.authorization;

  var splitToken = token.split(' ');

  if (splitToken.length === 2) {
      var bearer = splitToken[0];
      var jwtToken = splitToken[1];
      if (/^Bearer$/i.test(bearer)) {
        token = jwtToken;
      }
  }

  console.log('token', token);

  jwt.verify(token, jwtConfig.jwtSecret, function (err, decoded) {
      console.log(decoded);
      if (err){
        return res.status(403).json({
          message: 'failed to authenticate'
        })
      }
      // the usual error checking
      req.decoded = decoded
      next();
  })
})

// ********** ALL USER ADMIN ROUTES **********

// GET all users
adminRouter.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(users);
    });
});

// GET a specific user
adminRouter.get('/users/:username', function (req, res) {
    console.log(req.decoded);
    User.findOne({
        username: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// POST create a new user
adminRouter.post('/users', function (req, res) {
    // user validation
    if (!req.body) {
        return res.status(400).json({message: "No request body."});
    }

    // USERNAME

    if (!('username' in req.body)) {
        return res.status(422).json({message: "Missing field: username"});
    }

    var username = req.body.username.trim();

    if (typeof username !== 'string') {
        return res.status(422).json({message: "Incorrect field type: username"});
    }

    if (username === '') {
        return res.status(422).json({message: "Incorrect field length: username"});
    }

    // PASSWORD

    if (!('password' in req.body)) {
        return res.status(422).json({message: "Missing field: password"});
    }

    var password = req.body.password.trim();

    if (typeof password !== 'string') {
        return res.status(422).json({message: "Incorrect field type: password"});
    }

    if (password === '') {
        return res.status(422).json({message: "Incorrect field length: password"});
    }

    // EMAIL

    if (!('email' in req.body)) {
        return res.status(422).json({message: "Missing field: email"});
    }

    var email = req.body.email.trim();

    /*eslint-disable*/

    var regExTest = (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).test(email);

    /*eslint-disable*/

    if (!regExTest) {
        return res.status(422).json({message: "Incorrect field format: email"});
    }

    // salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }

        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                return res.status(500).json({message: 'Internal Server Error'});
            }

            User.create({
                username: username,
                password: hash,
                email: email
            }, function (err) {
                console.log('Error: ', err);
                if (err) {
                    return res.status(500).json({message: 'Internal Server Error'});
                }
                res.status(201).json({message: 'User successfully created'});
            });
        });
    });
});

// PUT update a user
adminRouter.put('/users/:username', function (req, res) {
    // permissions MUST be validated before this is an option
    var data = {}
    // if permission is all good do the following
    if (req.body.username && req.body.username.trim().length > 0) {
        data.username = req.body.username;
    }
    if (req.body.password && req.body.password.trim().length > 0) {
        data.password = req.body.password;
    }
    if (req.body.email && req.body.email.trim().length > 0) {
        data.email = req.body.email;
    }

    User.findOneAndUpdate({
        username: req.params.username
    }, data, {
        new: true
    }, function (err, user) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(user);
    });
});

// DELETE a user
adminRouter.delete('/users/:username', function (req, res) {
    // permissions MUST be validated before this is an option
    User.findOneAndRemove({
        username: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// ********** ALL FACT ADMIN ROUTES **********

// PUT update a fact
adminRouter.put('/facts/:id', function (req, res) {
    // check fields?
    var data = {}
    if (req.body.isApproved === true || req.body.isApproved === false) {
        data.isApproved = req.body.isApproved;
    }

    if (req.body.fact && req.body.source.trim().length > 0) {
        data.fact = req.body.fact;
    }
    if (req.body.source && req.body.source.trim().length > 0) {
        data.source = req.body.source;
    }

    Fact.findOneAndUpdate({
        _id: req.params.id
    }, data, {
        new: true
    }, function (err, fact) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(fact);
    });
});

// DELETE a fact
adminRouter.delete('/facts/:id', function (req, res) {
    // permissions MUST be validated before this is an option
    Fact.findOneAndRemove({
        _id: req.params.id
    }, function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(fact);
    });
});

module.exports = adminRouter;
