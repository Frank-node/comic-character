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
//let uri = 'mongodb://localhost/superherodb';
let uri = 'mongodb+srv://nodetest:dbTestbc@cluster0-3osxf.mongodb.net/superherodb?retryWrites=true&w=majority';
mongoose.connect(uri, {useNewUrlParser: true,useUnifiedTopology: true});


//Setup the superhero schema, default collection name is superheros
// const supheroSchema = new mongoose.Schema({
//   name: String,
//   image: String
// }, { collection: 'superheroes' }); //Set a different name for your collection

// const Superhero = mongoose.model("Superhero",supheroSchema);

// Superhero.create(
//   {
//     name: 'CAPTAIN MARVEL',
//     image: 'captainmarvel.jpg'
//   },
//   function(err, superhero){
//     if(err){
//       console.log(err);
//     } else {
//       console.log("Newly created superhero");
//       console.log(superhero);
//     }
//   });

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

// app.get('/', (req, res) => {
//   res.render('index', {});
// });
// const superheroes = [
//   { id: 1, name: 'SPIDER-MAN', image: 'spiderman.jpg' },
//   { id: 2, name: 'CAPTAIN MARVEL', image: 'captainmarvel.jpg' },
//   { id: 3, name: 'HULK', image: 'hulk.jpg' },
//   { id: 4, name: 'THOR', image: 'thor.jpg' },
//   { id: 5, name: 'IRON MAN', image: 'ironman.jpg' },
//   { id: 6, name: 'DAREDEVIL', image: 'daredevil.jpg' },
//   { id: 7, name: 'BLACK WIDOW', image: 'blackwidow.jpg' },
//   { id: 8, name: 'CAPTAIN AMERICA', image: 'captanamerica.jpg' },
//   { id: 9, name: 'WOLVERINE', image: 'wolverine.jpg' },
//   { id: 10, name: 'LUKE CAGE', image: 'lukecage.jpg' },
//   { id: 11, name: 'BATMAN', image: 'file-1583548086696Batman.jpg' },
//   { id: 12, name: 'ANT MAN', image: 'file-1583553186723Ant-Man.png' }
//];












