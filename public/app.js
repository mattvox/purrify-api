/* global $ */
/* global axios */

//var axios = require('axios');

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

        axios.post('/facts', data).then(function (res) {
            displayCatFact(res.data);
        }).catch(function (err) {
            console.log(err);
        })
    });
}

var getRandomCatFact = function () {
    axios.get('/facts/random').then(function (res) {
        displayCatFact(res.data);
    }).catch(function (err) {
        console.log(err);
    })
}

var getAllCatFacts = function () {
  axios.get('/facts').then(function (res) {
      res.data.forEach(function (fact) {
          displayCatFact(fact);
      })
  }).catch(function (err) {
      console.log(err);
  })
}

$(function () {
    addCatFact();
    //getRandomCatFact();
    getAllCatFacts();
});
