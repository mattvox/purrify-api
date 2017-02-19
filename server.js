var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var config = require("./config");
var User = require("./models/user");
var Fact = require("./models/fact");

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static("public"));

var runServer = function (callback) {
    mongoose.connect(config.DATABASE_URL, function (err) {
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function () {
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

// middleware for all routes will go here... i think???
app.use(function (req, res, next) {
    console.log('route requested, something is about to happen');
    next();
})

// test route
app.get('/api', function (req, res) {
    res.json({message: "It worked, it worked!!!"});
});

// GET a specific user
app.get('/users/:username', function (req, res) {
    User.findOne({
        username: req.params.username
    }, function (err, user) {
        if (err) {
            return res.status(404).json({message: 'User Not Found'});
        }
        res.json(user);
    });
});

// GET a random fact
app.get('/facts/random', function (req, res) {
    Fact.findOneRandom(function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'Fact Not Found'});
        }
        res.json(fact);
    });
});

// GET a specific fact
app.get('/facts/:id', function (req, res) {
    Fact.findOne({
        _id: req.params.id
    }, function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'Fact Not Found'});
        }
        res.json(fact);
    });
});

// POST a user
app.post('/users', function (req, res) {
    User.create({
        username: req.body.username,
        password: req.body.password
    }, function (err, user) {
        console.log(err);
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.status(201).json(user);
    });
});

// POST a fact
app.post('/facts', function (req, res) {
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

// PUT a fact

app.put('/facts/:id', function (req, res) {
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
    }, data, {new: true}, function (err, fact) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(fact);
    });
});
