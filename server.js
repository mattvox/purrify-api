var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var config = require("./config");
var User = require("./models/user");
var Fact = require("./models/fact");

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

// middleware for all routes will go here... i think???
server.use(function (req, res, next) {
    console.log('route requested, something is about to happen');
    next();
})

// TEST route
server.get('/api', function (req, res) {
    res.json({message: "It worked, it worked!!!"});
});

// ********** ALL USER ROUTES **********

// GET all users
server.get('/users', function (req, res) {
    User.find({}, function (err, users) {
        if (err) {
          return res.status(404).json({message: 'User Not Found'});
        }
        res.json(users);
    });
});

// GET a specific user
server.get('/users/:username', function (req, res) {
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
server.post('/users', function (req, res) {
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

// PUT update a user
server.put('/users/:username', function (req, res) {
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
    }, data, { new: true }, function (err, user) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(user);
    });
});

// DELETE a user
server.delete('/users/:username', function (req, res) {
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

// ********** ALL FACT ROUTES **********

// GET all facts
server.get('/facts', function (req, res) {
    Fact.find({}, function (err, facts) {
        if (err) {
            return res.status(404).json({message: 'Internal server error'});
        }
        res.json(facts);
    })
});

// GET a random fact
server.get('/facts/random', function (req, res) {
    Fact.findOneRandom(function (err, fact) {
        if (err) {
            return res.status(404).json({message: 'Fact Not Found'});
        }
        res.json(fact);
    });
});

// GET a specific fact
server.get('/facts/:id', function (req, res) {
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
server.post('/facts', function (req, res) {
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

// PUT update a fact
server.put('/facts/:id', function (req, res) {
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
    }, data, { new: true }, function (err, fact) {
        if (err) {
            return res.status(500).json({message: 'Internal Server Error'});
        }
        res.json(fact);
    });
});

// DELETE a fact
server.delete('/facts/:id', function (req, res) {
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
