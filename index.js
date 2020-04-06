//Set environment variables
require('dotenv').config();

// Create a express server
const express = require('express');
const app = express();

//Display the message
const flash = require('connect-flash');


//Require the data model
const Superhero = require('./models/superhero');
const Comment = require('./models/comment');
const User = require('./models/user');

//Add body-parser as middleware
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(urlencodedParser);


//requring routes
const commentRoutes    = require("./routes/comments"),
    superheroRoutes = require("./routes/superheroes"),
    indexRoutes      = require("./routes/index");

//PASSPORT CONFIGURATION
const passport    = require("passport");
const LocalStrategy = require("passport-local");
app.use(require("express-session")({
  secret: "Once again Rusty wins cutest dog!",
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(flash());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  //console.log(req.user);
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


// override with POST having ?_method=DELETE and ?_method=PUT
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
//Configure it to look at GET requests, but this is a really bad idea
//app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));


//Serving static files in Expres)
app.use(express.static('public'));


//Set the pug template engine
app.set('view engine', 'pug');

//Set the mongoose to connect mongodb
const mongoose = require('mongoose');

//let uri = process.env.LOCAL_DB;
let uri = process.env.CLOUD_DB;
mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology: true});

app.use("/", indexRoutes);
app.use("/superheroes", superheroRoutes);
app.use("/superheroes/:id/comments", commentRoutes);

// use port 3000 unless there exists a preconfigured port
const port = process.env.PORT || 3000;

// configure the port that expressis going to listen to
app.listen(port, (err) => {  
  if (err) {
    return console.log(`Unable to start the server on port ${port}`, err);
  }
  console.log(`This HTTP server is running on port ${port}`);
});














