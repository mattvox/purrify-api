var adminRouter = require('express').Router();

var User = require('../models/user');
var Fact = require('../models/fact');

var middleWare = require('./middleware');
var superRoutes = require('./super-routes');


// ********** ALL FACT ROUTES **********

// GET all facts (with filters)
adminRouter.get('/facts', middleWare('admin'), function (req, res) {
    var data = {
        isApproved: false,
        isTrash: false
    }

    if (req.query.approved) {
        data.isApproved = req.query.approved
    }

    if (req.query.trash) {
        data.isTrash = req.query.trash
    }

    Fact.find(data, function (err, facts) {
        if (err) {
            return res.status(404).json({message: 'Internal server error'});
        }
        res.json(facts);
    })
});

// PUT update a fact
adminRouter.put('/facts/:id', middleWare('admin'), function (req, res) {
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

// DELETE a fact (Send Trash, needs fixing, add param to PUT at same endpoint?)
adminRouter.delete('/facts/:id', middleWare('admin'), function (req, res) {
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

// ********** ALL USER ROUTES **********

// GET current user
adminRouter.get('/users', middleWare('admin'), function (req, res) {
    User.findOne({
        email: req.decoded.email
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// DELETE current user
adminRouter.delete('/users', middleWare('admin'), function (req, res) {
    User.findOneAndRemove({
        email: req.decoded.email
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// PUT update current user
adminRouter.put('/users', middleWare('admin'), function (req, res) {
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
        email: req.decoded.email
    }, data, {
        new: true
    }, function (err, user) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(user);
    });
});

// ********** ALL SUPER ADMIN ROUTES **********

adminRouter.use(superRoutes);


module.exports = adminRouter;
