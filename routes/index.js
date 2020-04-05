var express = require("express");
var router  = express.Router();
var passport = require("passport");
var User = require("../models/user");

//Set the route for home page
router.get("/", function(req, res){
  //res.render("landing");
  res.redirect('/superheroes'); 
});

//  ===========
// AUTH ROUTES
//  ===========

// show register form
router.get("/register", function(req, res){
  res.render("register"); 
});
//handle sign up logic
router.post("/register", function(req, res){
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
       if(err){
          req.flash("error", err.message);
          return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to Comic " + user.id);
        res.redirect("/superheroes"); 
       });
   });
});

// show login form
router.get("/login", function(req, res){
  res.render("login"); 
});
// handling login logic
router.post("/login", passport.authenticate("local", 
   {
       //successRedirect: "/superheroes",
       failureRedirect: "/login",
    failureFlash: 'Invalid username or password.' }), function(req, res){
    console.log(req.user.username)
    if (req.user.username === 'admin')
      res.redirect('/superheroes');
    else
      res.redirect('/superheroes?author=' + req.user.id);
});

// logic route
router.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Logged you out!");
  res.redirect("/superheroes");
});

module.exports = router;