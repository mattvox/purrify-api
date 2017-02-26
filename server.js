var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');

var config = require("./config");
var jwtConfig = require("./jwt-config");

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

// ********** MIDDLEWARE **********

var securePaths = ['/admin', '/admin/']

// server.use(function (req, res, next) {
//
//   // auth.initialize();
//
//
//   console.log('Method: ', req.method);
//   console.log('Request path: ', req.path);
//
//     if (_.includes(securePaths, req.path)) {
//
//
//
//         console.log('admin route requested, something is about to happen');
//     } else {
//         console.log('route requested, something is about to happen');
//     }
//
//     next();
// })

// TEST route
server.get('/api', function (req, res) {
    res.json({message: "It worked, it worked!!!"});
});

// ********** LOGIN ROUTES **********

server.post('/login', function (req, res) {
    User.findOne({email: req.body.email}).select('email password').exec(function (err, user) {
        if (err) {
            return res.status(404).json({message: "User Not Found"});
        }
        console.log(user);
        user.validatePassword(req.body.password, function (err, isValid) {
            console.log(err, isValid);
            if (err) {
                return res.status(418).json({message: 'Im a teapot'});
            }

            if (!isValid) {
                return res.json({message: 'Invalid password'});
            }

            // this is where we generate a token
            var token = jwt.sign({
                email: user.email
            }, jwtConfig.jwtSecret, {expiresIn: '8h'});
            res.json({token: token});
        })

    });

})

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

// ********** NEW MIDDLEWARE **********

server.use(function(req, res, next){

  var token = req.query.token || req.body.token || req.params['token'] || req.headers['x-access-token'];
  console.log(token);

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


// GET a specific user
server.get('/users/:username', function (req, res) {
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
server.post('/users', function (req, res) {
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
