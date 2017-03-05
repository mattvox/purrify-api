/* eslint-disable */

exports.DATABASE_URL = process.env.DATABASE_URL ||
    global.DATABASE_URL ||
    (process.env.NODE_ENV === 'production' ?
        'mongodb://heroku_btxqljpp:83jvn091ha297ksqu3vqeg9mt3@ds119210.mlab.com:19210/heroku_btxqljpp' :
        'mongodb://localhost/purrify-api-dev');

    // (process.env.NODE_ENV === 'production' ?
    //     'mongodb://localhost/purrify-api' :
    //     'mongodb://localhost/purrify-api-dev');

exports.PORT = process.env.PORT || 8080;
