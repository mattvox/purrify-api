var jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== 'production'){
    var jwtConfig = require('../jwt-config');
}

module.exports = function(permissions) {
  return function (req, res, next) {
    var token = req.query.token || req.body.token || req.params.token || req.headers['x-access-token'] || req.headers.authorization;

    if (token) {
        var splitToken = token.split(' ');

        if (splitToken.length === 2) {
            var bearer = splitToken[0];
            var jwtToken = splitToken[1];
            if (/^Bearer$/i.test(bearer)) {
                token = jwtToken;
            }
        }
    }

    jwt.verify(token, jwtConfig.jwtSecret || process.env.JWT_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).json({message: 'failed to authenticate'})
        }

        req.decoded = decoded

        if (!(req.decoded.permissions === 'super')) {
            if (!(req.decoded.permissions === permissions)) {
                return res.status(403).json({message: 'incorrect permissions'})
            }
        }

        next();
    })
  }
}
