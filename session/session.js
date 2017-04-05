// Write an express application - start one from scratch - that uses express-session. There are two pages: /ask, and /greet. The ask page asks the user to put in a name, and the greet page displays the greeting showing their name. You'll need to:
//
// Create an ask page that displays a form which submits to a submit handler, say /submit_name.
// The /submit_name handler will retrieve the name and save it into the session as a session variable.
// The greet page will display a greeting to the user's name as fetched from the session.
const express = require('express');
const Promise = require('bluebird');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
  secret:'ajsdhfkashflkajshdf',
  cookie: {
    maxAge: 60000
  }
}));

app.get('/', function (req, res) {
  res.render('ask.hbs', {
    name: req.session.loggedInUsername
  });
});

app.post('/submit', function (req, res) {
  var name = req.body.userName;
  req.session.loggedInUsername = name;
  res.redirect('/');
});

app.listen(3000, function() {
  console.log('Listening on port 3000.');
});
