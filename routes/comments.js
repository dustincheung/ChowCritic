//requiring express
var express = require("express");

//new instance of router where all routes will be added to
var router = express.Router();

//importing necessary models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

//*************************************************
//					COMMENTS ROUTE
//************************************************
//NESTED ROUTES FOR COMMENT NEW AND CREATE ROUTE

//NEW ROUTE: shows form to make new comments (calls post restaurants post route)
router.get("/restaurants/:id/comments/new", isLoggedIn, function(req,res){
	var id = req.params.id;

	Restaurant.findById(id, function(err, restaurant){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {restaurant:restaurant});
		}
	});
});

router.post("/restaurants/:id/comments", isLoggedIn, function(req, res){
	//lookup restaurant using id
	var id = req.params.id;

	Restaurant.findById(id, function(err, restaurant){
		if(err){
			console.log(err);
			res.redirect("/restaurants");
		}else{
			//create a new comment
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
				}else{
					//add comment to restaurant and redirect to show page
					restaurant.comments.push(comment);
					restaurant.save();
					res.redirect("/restaurants/" + restaurant._id);
				}
			});
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