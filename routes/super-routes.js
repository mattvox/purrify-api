var superRouter = require('express').Router();
var bcrypt = require('bcryptjs');

var User = require('../models/user');
var middleWare = require('./middleware');


// GET all users
superRouter.get('/users/all', middleWare('super'), function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(users);
    });
});

// GET a specific user
superRouter.get('/users/:email', middleWare('super'), function (req, res) {
    User.findOne({
        email: req.params.email
    }, function (err, user) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        if (!user) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// POST create a new user
superRouter.post('/users', middleWare('super'), function (req, res) {
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

    // SALT

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
superRouter.put('/users/:username', middleWare('super'), function (req, res) {
    var data = {}

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
superRouter.delete('/users/:username', middleWare('super'), function (req, res) {
    User.findOneAndRemove({
        username: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

module.exports = superRouter;
