//requiring express
var express = require("express");

//new instance of router where all routes will be added to
var router = express.Router();

//importing necessary models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

//importing middleware functions (used for authentication and authorization)
var middleware = require("../middleware/index.js");

//requiring geocoder for google maps api
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY, //environmental variable that can be found in .env file
  formatter: null
};
 
var geocoder = NodeGeocoder(options);

//************************************************
//				  RESTAURANT ROUTES
//************************************************

//INDEX ROUTE: shows all restaurants
router.get("/restaurants", function(req, res){
	//retrieve all restaurants from mongo database, specify no specific attribute (b/c we want all restaurants)
	//callback function allows us to see if err occurs, and 2nd arg is the restaurants found in db
	Restaurant.find({}, function(err, restaurants){
		if(err){
			console.log(err);
		}else{
			//render restaurants view with restaurants found from db
			res.render("restaurants/index.ejs", {restaurants: restaurants}); 
		}
	});

});

//NEW ROUTE: shows form to make new restaurant (calls post restaurants post route)
router.get("/restaurants/new", middleware.isLoggedIn, function(req, res){
	res.render("restaurants/new.ejs");
});

//CREATE ROUTE: creates and adds new restaurant to database and redirects to INDEX ROUTE
router.post("/restaurants", middleware.isLoggedIn, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var rating = req.body.rating;

  var author = {
      id: req.user._id,
      username: req.user.username
  }

  //get lat, long, location, from inputted geocoded location
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "This address is invalid!");
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var long = data[0].longitude;
    var location = data[0].formattedAddress;

    var restaurant = {name: name, image:image, description:description, rating:rating, author:author, location:location, lat:lat, long:long};
    
    Restaurant.create(restaurant, function(err, restaurant){
        if(err){
            console.log(err);
        } else {
            //redirect back to restaurants page
            console.log(restaurant);
            res.redirect("/restaurants");
        }
    });
  });
});

//SHOW ROUTE: shows info about one restaurant (make sure this route comes after NEW ROUTE so it doesn't overrwrite)
router.get("/restaurants/:id", function(req, res){
	var id = req.params.id;

	//populate method is used to fill comment arrays w/ actual comments and not just ids
	Restaurant.findById(id).populate("comments").exec(function(err, restaurantFound){
		if(err){
			console.log(err);
		}else{
			//render show page with this specific restaurant
			res.render("restaurants/show.ejs", {restaurant:restaurantFound})
		}
	});
});

//EDIT ROUTE: shows edit form for a specific restaurant
router.get("/restaurants/:id/edit", middleware.isUserTheAuthor,function(req, res){
	var id = req.params.id;
	Restaurant.findById(id, function(err, restaurantFound){
		res.render("restaurants/edit.ejs", {restaurant:restaurantFound});
	});
});

//UPDATE ROUTE: updates specific restaurant and redirects to show route
router.put("/restaurants/:id", middleware.isUserTheAuthor, function(req, res){
  //old restaurant id
  var id = req.params.id;
  //new restaurant obj w/ updated values
  var restaurant = req.body.restaurant; 

  //get lat, long, location from geocoded location
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "This address is invalid!");
      return res.redirect("back");
    }
    restaurant.lat = data[0].latitude;
    restaurant.long = data[0].longitude;
    restaurant.location = data[0].formattedAddress;

    Restaurant.findByIdAndUpdate(id, restaurant, function(err, updatedRestaurant){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            res.redirect("/restaurants/" + id);
        }
    });
  });
});

//DESTROY ROUTE: removes specific restaurant from db and redirects to index route
router.delete("/restaurants/:id", middleware.isUserTheAuthor, function(req, res){
	var id = req.params.id;
	Restaurant.findByIdAndRemove(id, function(err){
		if(err){
			res.redirect("/restaurants");
		}else{
			res.redirect("/restaurants");
		}
	})
});

//export router
module.exports = router;