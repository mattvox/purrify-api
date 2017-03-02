/* global $ */
/* global axios */

//var axios = require('axios');

var authStr = 'Bearer '.concat(localStorage.getItem('token'));

var admin = axios.create();

admin.defaults.headers.common['Authorization'] = authStr;



var displayCatFact = function (data) {
    var factTemplate = `<li>${data.fact}</li>`;

    $('#js-results ul').append(factTemplate);
}

var addCatFact = function () {
    $('#js-fact-submit').on('submit', function (event) {
        event.preventDefault();

        var data = {}

        data.source = $(this).find('#cat-source').val();
        data.fact = $(this).find('#cat-fact').val();

        $(this).find('#cat-source').val(null);
        $(this).find('#cat-fact').val(null);

        axios.post('/api/facts', data).then(function (res) {
            displayCatFact(res.data);
        }).catch(function (err) {
            console.log(err);
        })
    });
}

var getAllUsers = function () {
    admin.get('/admin/users').then(function (res) {
      console.log('response: ', res);
    }).catch(function (err) {
      console.log(err);
    })
}

var getRandomCatFact = function () {
    axios.get('/api/facts/random').then(function (res) {
        displayCatFact(res.data);
    }).catch(function (err) {
        console.log(err);
    })
}

var getAllCatFacts = function () {
    axios.get('/api/facts/all').then(function (res) {
        res.data.forEach(function (fact) {
            displayCatFact(fact);
        })
    }).catch(function (err) {
        console.log(err);
    })
}

// var getAllCatFacts = function () {
//     axios.get('/api/facts?token=' + localStorage.getItem('token')).then(function (res) {
//         res.data.forEach(function (fact) {
//             displayCatFact(fact);
//         })
//     }).catch(function (err) {
//         console.log(err);
//     })
// }

// login

var userLogin = function () {
    $('#js-login').on('submit', function (event) {
        event.preventDefault();

        var data = {}

        data.email = $('#email').val();
        data.password = $('#password').val();

        $('#email').val(null);
        $('#password').val(null);

        axios.post('/login', data).then(function (res) {
            console.log('logged?', res);

            localStorage.setItem('token', res.data.token);

            $('#admin').toggleClass('hidden');

        }).catch(function (err) {
            console.log(err);
        })
    });
}

var userLogout = function () {
  $('#logout').on('click', function(event) {
    event.preventDefault();

    localStorage.removeItem('token');

    $('#admin').toggleClass('hidden');
  })
}

$(function () {


    getAllUsers();

    addCatFact();
    //getRandomCatFact();

    getAllCatFacts();

    userLogin();
    userLogout();
});
