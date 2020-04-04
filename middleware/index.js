var Superhero = require("../models/superhero");
var Comment = require("../models/comment");

// all the middleare goes here
var middlewareObj = {};

middlewareObj.checkSuperheroOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
    Superhero.findById(req.params.id, function(err, foundSuperhero){
        if(err || !foundSuperhero){
            console.log(err);
            req.flash('error', 'Sorry, that superhero does not exist!');
            res.redirect('/superheroes');
           }  else {
               // does user own the campground?
            if(foundSuperhero.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash('error', 'You don\'t have permission to do that!');
                res.redirect('/superheroes/' + req.params.id);
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err || !foundComment){
                console.log(err);
                req.flash('error', 'Sorry, that comment does not exist!');
                res.redirect('/superheroes');
           }  else {
               // does user own the comment?
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                res.redirect('/superheroes/' + req.params.id);
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", 'Please log in first!');
    res.redirect("/login");
}

module.exports = middlewareObj;