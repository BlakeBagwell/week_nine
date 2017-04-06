const express = require('express');
const Promise = require('bluebird');
const pgp = require('pg-promise')({
  promiseLib: Promise
});
const bodyParser = require('body-parser');
const app = express();
const fsp = require('fs-promise');
const session = require('express-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

const db = pgp({
  database: 'yelp_db'
});

app.use(session({
  secret:'ajsdhfkashflkajshdf',
  cookie: {
    maxAge: 60000000
  }
}));

// app.use(function(req, resp, next) {
//   resp.local.session = req.session;
//   next();
// });

app.use(function myMiddleware(request, response, next) {
  var contents = request.method + ' ' + request.path;
  fsp.appendFile('logfile.txt', contents)
    .then(function() {
      next();
    })
    .catch(next);
});

app.get('/', function(req, resp){
  resp.render('login_signup.hbs', {
    name: req.session.userKey
  });
});

app.post('/account_created', function(req, resp) {
  var name = req.body.usernameFromForm;
  var attempt_one = req.body.passwordFromForm1;
  var attempt_two = req.body.passwordFromForm2;
  var email = req.body.emailFromForm;
  var karma = 2;
  if (attempt_one === attempt_two) {
    bcrypt.hash(attempt_one, 10)
      .then(function(encryptedPassword){
        db.none(`insert into reviewer (name, email, password) values ($1, $2, $3)`, [name, email, encryptedPassword]);
        console.log(encryptedPassword);
      })
      .catch(function(err) {
        console.log(err.message);
      });
    resp.send('Account created! Please <a href="/">Login</a>');
  }
  else {
    resp.send('Account creation failed Please <a href="/">try again</a>');
  }
});

app.post('/login', function(req, resp, next) {
  var name = req.body.usernameFromForm; //grabbing the user input
  var password = req.body.passwordFromForm; //grabbing the user input
  db.one(`
    select
      reviewer.password
    from
      reviewer
    where
      reviewer.name = $1`, [name]
    ) //accessing the database. we are grabbing the encrypted password (that is saved on the database) that is associated with the name the user gave us, we pass that down the chain
    .then(function(encryptedPassword) { //we now have the password from the table
      return bcrypt.compare(password, encryptedPassword.password)//we now use bcrypt to compare what the user gave (which is passed through encryptiong) and then compared with what is stored in the database, and we pass down a boolean
    })
    .then(function(matched){ //we now have the boolean
      if (matched) { //we check if the boolean is true, if yes VVV
        req.session.userKey = name; //we assign the userKey a value, in this case the name they entered when trying to log in. Now the user will have a session and we can go through the authentication process.
        resp.redirect('/search');// This will bring us to the search page, but first it has to pass through authentication, if the userKey has a value, it will be authenticated.
      console.log('It matched?', matched);
      }
      else {
        console.log('Did not match');
        resp.redirect('/')
      }
    })
    .catch(function(err) {
      console.log('Login unsuccessful', err.message);
      resp.redirect('/')
    });
});

// bcrypt.compare(correctPassword, encryptedPassword)
//   .then(function(matched){
//     console.log('It matched?', matched);
//   })
//   .catch(function(err) {
//     console.log(err.message);
//   })

app.use(function authentication(req, resp, next){
  if (req.session.userKey) {
    next();
  } else {
    resp.send('Login failed. <a href="/">Login</a>');
  }
});
// app.get('/', function(req, resp) {
//   resp.render('search_form.hbs');
// });
app.get('/search', function(req, resp) {
  resp.render('search_form.hbs');
});
//This is basically our home page. So when someone goes here we need to tell it what to do and how to appear so we have created a form to show up as our base page. this will render the search_form.hbs page we have created in the views folder.

//now because we have made a way for people to get to the search page (via the 'go' button plus the action="/search" section of the form, we need a way to handle/generate page with something. )
app.get('/search_results', function(req, resp, next) {
  let term = req.query.searchTerm;
  //if we refer back to the form page, we see that whatever someone types into the search field, its given the name of searchTerm via the name="searchTerm", so we grab that and use it here.
  console.log('Term:', term);
  //now that we have the search term, we can use in in our database query.
  db.any(`
    select * from restaurant
    where restaurant.name ilike '%${term}%'
    `)
    //here we get a promise, which is an array of restaurants, their names, etc. based on what the user searched. We can see that by the "ilike '%${term}%'". It specifically looks for restaurants with a name that looks like what th euser searched.
    .then(function(resultsArray) {
      //now we have passed the array that the promise gave us and we use that.
      console.log('results', resultsArray);
      //we render the results page, because we need to do something with the array that we got back.
      resp.render('search_results.hbs', {// the results.hbs file is what we will use for our next page. On that page (once we look at it) we see that the hbs file actually needs a key from this page. so we name it results here, and name it results there. THEN the value we give the key here, in this case 'resultsArray', will be passed to the key in the results.hbs page.
        results: resultsArray
      });
    })
    .catch(next);//this will catch our error.
});

app.get('/restaurant/:id', function(req, resp, next) {//so now we have a handler for our new page.
  let id = req.params.id; //we will need to use the id the last page gave us, so here we store it in a variable. Then we make a query to the database, and generate all relevant data base on what restaurant we want to know about (we use the id as a filter at the very bottom of the query.)
  db.any(`
    select
      restaurant.name as restaurant_name,
      restaurant.address,
      restaurant.category,
      reviewer.name as reviewer_name,
      review.title,
      review.stars,
      review.review_text
    from
      restaurant
    left outer join
      review on review.restaurant_id = restaurant.id
    left outer join
      reviewer on review.reviewer_id = reviewer.id
    where restaurant.id = ${id}
  `)
  //all of this will generate a table with the restaurant, its reviews, and who reviewed it.

    .then(function(reviews) {//using the promise we just got, we generate a page that we will call restaurants. and that uses the following keys under the render portion. restaurant. reviews. hasReviews.
      console.log('reviews', reviews);
      resp.render('restaurant.hbs', {
        restaurant: reviews[0],
        reviews: reviews,
        hasReviews: reviews[0].reviewer_name
      });
    })
    .catch(next);
});

// app.post('submit_review/:id', function(req, resp, next) {
//   var restaurantId = req.params.id;
//   db.none(`
//     insert into review values
//     `)
// })

app.listen(3000, function() {
  console.log('Listening on port 3000.');
});
