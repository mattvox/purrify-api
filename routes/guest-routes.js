var guestRouter = require('express').Router();

var Fact = require('../models/fact');

// GET a random fact
guestRouter.get('/facts', function (req, res) {
    Fact.findRandom({}, {}, { limit: req.query.num || 1 }, function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'Fact Not Found'});
        }
        res.json(fact);
    });
});

// GET all facts
guestRouter.get('/facts/all', function (req, res) {

// ADD isApproved: true HERE BEFORE DEPLOYMENT

    Fact.find({}, function (err, facts) {
        if (err) {
            return res.status(404).json({message: 'Internal server error'});
        }
        res.json(facts);
    })
});

// GET a specific fact
guestRouter.get('/facts/:id', function (req, res) {
    Fact.findOne({
        _id: req.params.id
    }, function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'Fact Not Found'});
        }
        res.json(fact);
    });
});

// POST create a new fact
guestRouter.post('/facts', function (req, res) {
    console.log(req.body);
    Fact.create({
        fact: req.body.fact,
        source: req.body.source
    }, function (err, fact) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.status(201).json(fact);
    });
});

// CATCH-ALL

guestRouter.use('*', function (req, res) {
  res.status(404).json({message: '404: Not Found'});
})

module.exports = guestRouter;
