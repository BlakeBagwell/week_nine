const express = require('express');
const Promise = require('bluebird');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const app = express();

const db = pgp({database: 'yelp_db'});


app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended: false}));

// Create the home page for the site at the root URL /. The home page should contain a form with big search box in the middle of the page - kind of like Google. The form should use the GET method for submission, so that when the user types a search query and submits the form, it goes to the search results page - to be created in the next step - with the search query set as a query parameter after that URL, i.e. /search?searchTerm=burger.
//
// No database query is necessary for this request handler.
// You'll need to create a view file
app.get('/', function (req, res) {
  res.render('form.hbs');
});

app.get('/search', function (req, res) {
  res.render('another.hbs');
});





app.listen('3000', function() {
  console.log('Listening on port 3000!');
});
