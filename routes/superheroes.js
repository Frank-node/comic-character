var express = require("express");
var router  = express.Router();
var Superhero = require("../models/superhero");
var middleware = require("../middleware");

//Use multer Module to handle the files uploaded
const multer  = require('multer');
//const upload = multer({ dest: 'upload' });
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/img/superheroes')
  },
  filename: function (req, file, cb) {
      //const extension = file.originalname.split('.').pop(); 
      console.log(file);
      cb(null, file.fieldname + '-' + Date.now() + file.originalname);
  }
})
const upload = multer({ storage: storage });

// ====================
// SUPERHEROES ROUTES
// ====================

//Set the router for the list of all superheroes page or the superheroes created by current user
router.get('/', (req, res) => {
  
  if(!req.query.author){
  //Get all superheroes from mongodb
  Superhero.find({},function(err, allSuperheroes){
    if(err){
      console.log(err);
    } else {
      allSuperheroes.reverse();
      res.render('superheroes/index', { superheroes: allSuperheroes });
      console.log(allSuperheroes);
     }
  })
  //res.render('index', { superheroes: superheroes });
} else {
    console.log(req.query.author);
    Superhero.find().where('author.id').equals(req.query.author).exec(function(err, allSuperheroes){
      if(err){
        console.log(err);
      } else {
        allSuperheroes.reverse();
        res.render('superheroes/index', {superheroes: allSuperheroes, current: 'true'});
        console.log(allSuperheroes);
       }
    })

}
});

//Get the new superhero view
router.get('/new', middleware.isLoggedIn,(req, res) => {
  res.render('superheroes/new');
});

//the router for the detail of superhero page
router.get('/:id', (req, res) => {
  // const selectedId = req.params.id;
  // //the usage of filter() method of Array
  // // let selectedSuperhero = superheroes.filter(superhero => {
  // //   //+selectedId: convert string to number, as Number(selectedId)
  // //   return superhero.id === +selectedId;
  // // });
  // //selectedSuperhero = selectedSuperhero[0]; 
  // //the usage find() method of Array 
  // let selectedSuperhero = superheroes.find( superhero => superhero.id === +selectedId );
  // console.log(selectedSuperhero);
  // res.render('superhero', { superhero: selectedSuperhero });

  Superhero.findById(req.params.id).populate("comments").exec(function(err, foundSuperhero){
    if(err){
      console.log(err);
    } else {
      res.render('superheroes/show', { superhero: foundSuperhero });
      console.log(foundSuperhero);
    }
  })
  
});

//Include File System module
const fs = require('fs');

//Set the route to delete a superhero 
// router.delete('/:id', (req, res) => {
//     Superhero.findOneAndRemove({'_id' : req.params.id}, function(err, deletedSuperhero){
//     if(err){
//       res.redirect('/superheroes'); 
//     } else {
      
//       console.log(deletedSuperhero);
//       const deletedFilename = __dirname + "/public/img/superheroes/"+ deletedSuperhero.image;
//       console.log(deletedFilename);
//       //fs.unlinkSync(deletedFilename);  // delete file synchronously
      
//       // delete file asynchronously
//       if(fs.existsSync(deletedFilename)){
//         fs.unlink(deletedFilename, (err) => {
//           if (err) throw err;
//           console.log('successfully deleted images from folder superheroes');
//         });
//       }
//       res.redirect('/superheroes');
//       // Comment.deleteMany( {_id: { $in: deletedSuperhero.comments } }, (err) => {
//       //   if (err) {
//       //       console.log(err);
//       //   }
//       //   res.redirect('/superheroes'); 
//       // }); 
//     }
//   })
// });

//Delete a superhero
router.delete("/:id", middleware.checkSuperheroOwnership, async(req,res)=>{
  try {
    let deletedSuperhero = await Superhero.findById(req.params.id);
    await deletedSuperhero.remove();
    console.log(deletedSuperhero);
      const deletedFilename = __dirname + "/public/img/superheroes/"+ deletedSuperhero.image;
      console.log(deletedFilename);
      //fs.unlinkSync(deletedFilename);  // delete file synchronously
      
      // delete file asynchronously
      if(fs.existsSync(deletedFilename)){
        fs.unlink(deletedFilename, (err) => {
          if (err) throw err;
          console.log('successfully deleted images from folder superheroes');
        });
      }
    res.redirect("/superheroes");
  } catch (error) {
    res.redirect("/superheroes");
  }
});


// router.delete("/:id", checkCampgroundOwnership, (req, res) => {
//   Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
//       if (err) {
//           console.log(err);
//       }
//       Comment.deleteMany( {_id: { $in: campgroundRemoved.comments } }, (err) => {
//           if (err) {
//               console.log(err);
//           }
//           res.redirect("/campgrounds");
//       });
//   })
// });

//Create a new superhero
router.post('/', middleware.isLoggedIn, upload.single('file'), (req, res) => {
  //const newId = superheroes[superheroes.length - 1].id + 1;
  console.log('body',req.body);
  console.log('file',req.file);
  const author = {
    id: req.user._id,
    username: req.user.username
  };
  const newSuperhero = {
    //id: newId, 
    name: req.body.superhero.toUpperCase(), 
    image: req.file.filename,
    description: req.body.description,
    author: author
  };
  Superhero.create(newSuperhero,   function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      console.log("Newly created superhero");
      res.redirect('/superheroes'); //redirect back to the homepage
      console.log(newlyCreated);
    }
  });
  
  //superheroes.push(newSuperhero);  
  //res.redirect('/');
});

//edit view
router.get('/:id/edit', middleware.checkSuperheroOwnership, (req, res) => {
  //internal scope of this function
  // MongoClient.connect(url, function (err, client) {
  //     const db = client.db('comics');
  //     const collection = db.collection('superheroes');
  //     const selectedId = req.params.id;

  //     collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
  //         client.close();
  //         res.render('update', { superheroe: documents[0] });
  //     });
  // });
  
  Superhero.findById(req.params.id, function(err, foundSuperhero){
    if(err){
      console.log(err);
    } else {
      res.render('superheroes/edit', { superhero: foundSuperhero });
      console.log(foundSuperhero);
    }
  })

});

//Update superhero
router.put('/:id', middleware.checkSuperheroOwnership, upload.single('file'), (req, res) => {

  const newSuperhero = {
    name: req.body.superhero.toUpperCase(), 
    image: req.file.filename
  }

  if (req.file){
      console.log("Updating image");
      newSuperhero.image = req.file.filename;
  }

  Superhero.findByIdAndUpdate(req.params.id, {$set: newSuperhero}, function(err, originalSuperhero){
    if(err){
      res.redirect('/superheroes'); 
    } else {
      
      console.log(originalSuperhero);
      const deletedFilename = __dirname + "/public/img/superheroes/"+ originalSuperhero.image;
      console.log(deletedFilename);
      //fs.unlinkSync(deletedFilename);  // delete file synchronously
      
      // delete file asynchronously
      if(fs.existsSync(deletedFilename)){
        fs.unlink(deletedFilename, (err) => {
          if (err) throw err;
          console.log('successfully deleted images from folder superheroes');
        });
      }
      res.redirect('/superheroes/'+ req.params.id); 
    } 
  })




  // MongoClient.connect(url, function (err, client) {
  //     const db = client.db('comics');
  //     const collection = db.collection('superheroes');
  //     const selectedId = req.params.id;

  //     //Delete the old hero image
  //     collection.find({ "_id": ObjectID(selectedId) }).toArray((error, documents) => {
  //       fs.unlink(__dirname + "/public/img/superheroes/" + documents[0].image, (err) => {
  //           if (err) throw err;
  //           console.log('successfully deleted images from folder superheroes');
  //       });
  //     });
  //     //from command line we update an object collection with the following syntax
  //     //db.superheroes.updateOne({"name":"ANT MAN"}, { $set: { "name":"ANT MAN 1"} })

  //     let filter = { "_id": ObjectID(selectedId) };

  //     let updateObject = {
  //         "name": req.body.superhero.toUpperCase(),
  //     }

  //     if (req.file){
  //         console.log("Updating image");
  //         updateObject.image = req.file.filename;
  //     }
      
  //     let update = {
  //         $set: updateObject
  //     };

  //     collection.updateOne(filter, update);

  //     client.close();
  //     res.redirect('/');
  // });
});

//middleware
// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//       return next();
//   }
//   res.redirect("/login");
// }

module.exports = router;