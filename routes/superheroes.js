var express = require("express");
var router  = express.Router();
var Superhero = require("../models/superhero");
var middleware = require("../middleware");
var User = require("../models/user");
const path = require("path");

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
const imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter})
//const upload = multer({ storage: storage });
//Config the cloundiary
const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'learnnodejs', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ====================
// SUPERHEROES ROUTES
// ====================

//Set the router for the list of all superheroes page or the superheroes created by current user
router.get('/', (req, res) => {  
  if(req.query.author){
    //Get he superheroes created by current user
    console.log(req.query.author);
    User.findById(req.query.author, function(err, foundUser){
      if(err || !foundUser){
          console.log(err);
          req.flash('error', 'Sorry, that user does not exist!');
          res.redirect('/superheroes');
      } else {
          if(foundUser.username === 'admin')
            res.redirect('/superheroes');
          else{
          Superhero.find().where('author.id').equals(req.query.author).exec(function(err, allSuperheroes){
          if(err){
            console.log(err);
          } else {
            allSuperheroes.reverse();
            res.render('superheroes/index', {superheroes: allSuperheroes, current: foundUser.username});
            //console.log(allSuperheroes);
          }
        })
      }
      }})
    
 //res.render('index', { superheroes: superheroes });
  } else {
  //Get all superheroes from mongodb
      Superhero.find({},function(err, allSuperheroes){
        if(err){
          console.log(err);
        } else {
          allSuperheroes.reverse();
          res.render('superheroes/index', { superheroes: allSuperheroes });
          //console.log(allSuperheroes);
         }
      })
  }
  //res.redirect("/");
});

//Get the new superhero view
router.get('/new', middleware.isLoggedIn,(req, res) => {
  res.render('superheroes/new');
});

//the router for the detail of superhero page
router.get('/:id', (req, res) => {
  
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

//Delete a superhero
router.delete("/:id", middleware.checkSuperheroOwnership, async(req,res)=>{
  try {
    let deletedSuperhero = await Superhero.findById(req.params.id);
    await deletedSuperhero.remove();
    console.log(deletedSuperhero);
    //destroy the file from cloudinary
    destroyFromCloudinary(deletedSuperhero.image); 
    
    res.redirect("/superheroes?author="+ currentUser.id);
  } catch (error) {
    res.redirect("/superheroes");
  }
});

//Create a new superhero
router.post('/', middleware.isLoggedIn, upload.single('file'), (req, res) => {
  console.log("req.file.path: "+req.file.path);
  cloudinary.uploader.upload(req.file.path, function(result) {
    // add cloudinary url for the image to the campground object under image property
    console.log('result: '+ result.public_id);  
    //const newId = superheroes[superheroes.length - 1].id + 1;
    console.log('body',req.body);
    console.log('file',req.file);

    //let deletedFilename = __dirname + "/public/img/superheroes/"+ newSuperhero.image;
    let deletedFilename = path.resolve(__dirname, '../'+ req.file.path);
    //delete temporary file in the local upload folder
    deleteTemFile(deletedFilename);
    
    // add author to campground
    const author = {
      id: req.user._id,
      username: req.user.username
    };
    // add cloudinary url for the image to the campground object under image property
    const newSuperhero = {
      //id: newId, 
      name: req.body.superhero.toUpperCase(), 
      image: result.secure_url,
      //image: req.file.filename,
      description: req.body.description,
      author: author
    };
    Superhero.create(newSuperhero,   function(err, newlyCreated){
      if(err){
        console.log(err);
      } else {
        console.log("Newly created comic character");
        res.redirect('/superheroes'); //redirect back to the homepage
        console.log(newlyCreated);
      }
    });
  });  
});

//edit view
router.get('/:id/edit', middleware.checkSuperheroOwnership, (req, res) => {
    
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
    description: req.body.description
  }
  
  if (req.file){
      console.log("Updating image");
      console.log('req.file.path: ' + req.file.path);
      //newSuperhero.image = req.file.filename;
      cloudinary.uploader.upload(req.file.path, function(result) {
        console.log('result.secure_url:' + result.secure_url);
        newSuperhero.image = result.secure_url;
        console.log('newSuperhero: ' + newSuperhero);

        //let deletedFilename = __dirname + "/public/img/superheroes/"+ newSuperhero.image;
        let deletedFilename = path.resolve(__dirname, '../'+ req.file.path);
        //delete temporary file in the local upload folder
        deleteTemFile(deletedFilename);
                
        Superhero.findByIdAndUpdate(req.params.id, {$set: newSuperhero}, function(err, originalSuperhero){
          if(err){
            res.redirect('/superheroes'); 
          } else {
            //destroy the file from cloudinary
            destroyFromCloudinary(originalSuperhero.image); 
            
            res.redirect('/superheroes/'+ req.params.id); 
           } 
          });
        });
  } else {
    console.log('newSuperhero: ' + newSuperhero);
    Superhero.findByIdAndUpdate(req.params.id, {$set: newSuperhero}, function(err, originalSuperhero){
      if(err){
        res.redirect('/superheroes'); 
      } else {      
        res.redirect('/superheroes/'+ req.params.id); 
      } 
    });
  }
});

//destroy the file from cloudinary
function destroyFromCloudinary (filePath) { 
  let lastindex = filePath.lastIndexOf('/');
  if (lastindex != -1){
    let cloudinary_publicId = filePath.substr(lastindex+1,20);
    console.log(cloudinary_publicId);
    cloudinary.uploader.destroy(cloudinary_publicId, function(result) { console.log(result) });
  }

}

//delete temporary file in the local upload folder
function deleteTemFile(deletedFilename){
  console.log(deletedFilename);
  //fs.unlinkSync(deletedFilename);  // delete file synchronously
  
  // delete file asynchronously
  if(fs.existsSync(deletedFilename)){
    fs.unlink(deletedFilename, (err) => {
      if (err) throw err;
      console.log('successfully deleted images from local upload folder');
    });
  }
}      

module.exports = router;