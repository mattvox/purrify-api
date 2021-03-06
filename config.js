/* eslint-disable */

const MONGODB_URI = process.env.MONGODB_URI;

exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    (process.env.NODE_ENV === 'production' ?
        MONGODB_URI :
        'mongodb://localhost/purrify-api-dev');

    // (process.env.NODE_ENV === 'production' ?
    //     'mongodb://localhost/purrify-api' :
    //     'mongodb://localhost/purrify-api-dev');

exports.PORT = process.env.PORT || 8080;
