//requiring express
var express = require("express");

//new instance of router where all routes will be added to
var router = express.Router();

//importing necessary models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

//************************************************
//				  RESTFUL ROUTES
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
router.get("/restaurants/new", function(req, res){
	res.render("restaurants/new.ejs");
});

//CREATE ROUTE: adds new restaurant to database and redirects to INDEX ROUTE
//get data from form and add it to array and redirect back to restaurant page
router.post("/restaurants", function(req, res){
	var name = req.body.name; //parses restaurant name from req that came from form
	var image = req.body.image; //parses image url from req that came from form
	var description = req.body.description //parses description from req that cam from form
	var restaurant = {name: name, image: image, description: description}; //creates new restaurant obj

	//adding restaurant obj to db
	Restaurant.create(restaurant, function(err, restaurant){   
		if(err){
			console.log(err);
		}else{
			res.redirect("/restaurants"); //redirects to INDEX ROUTE
		}
	});
});

//SHOW ROUTE: shows info about one restaurant (make sure this route comes after NEW ROUTE so it doesn't overrwrite)
router.get("/restaurants/:id", function(req, res){
	//find restaurant with specific id
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

//middleware to check if a user is logged in
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

//export routers
module.exports = router;