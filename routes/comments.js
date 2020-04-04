var express = require("express");
var router  = express.Router({mergeParams: true});
var Superhero = require("../models/superhero");
var Comment = require("../models/comment");
const middleware = require("../middleware/index")


// ====================
// COMMENTS ROUTES
// ====================

//Get the new comment view
router.get("/new", middleware.isLoggedIn, function(req, res){
  // find campground by id
  console.log(req.params.id);
  Superhero.findById(req.params.id, function(err, foundSuperhero){
      if(err){
          console.log(err);
      } else {
           res.render("comments/new", {superhero: foundSuperhero});
      }
  })
});

//Create a new comment
router.post("/", middleware.isLoggedIn, function(req, res){
  //lookup superhero using ID
  Superhero.findById(req.params.id, function(err, superhero){
      if(err){
          console.log(err);
          res.redirect("/");
      } else {
       Comment.create(req.body.comment, function(err, comment){
          if(err){
              console.log(err);
          } else {
            //add username and id to comment
            console.log(req.user)
            comment.author.id = req.user.id;
            comment.author.username = req.user.username;
            //save comment
            comment.save();
            superhero.comments.push(comment);
            superhero.save();
            res.redirect('/superheroes/' + superhero.id);
          }
       });
      }
  });
  //create new comment
  //connect new comment to campground
  //redirect campground show page
});

// COMMENT EDIT ROUTE
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
  Comment.findById(req.params.comment_id, function(err, foundComment){
     if(err){
         res.redirect("back");
     } else {
       res.render("comments/edit", {superhero_id: req.params.id, comment: foundComment});
     }
  });
});

// COMMENT UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
     if(err){
         res.redirect("back");
     } else {
         res.redirect("/superheroes/" + req.params.id );
     }
  });
});

// COMMENT DESTROY ROUTE
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   //findByIdAndRemove
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
      if(err){
          res.redirect("back");
      } else {
          req.flash("success", "Comment deleted");
          res.redirect("/superheroes/" + req.params.id);
      }
   });
});

//middleware
// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//       return next();
//   }
//   res.redirect("/login");
// }

module.exports = router;