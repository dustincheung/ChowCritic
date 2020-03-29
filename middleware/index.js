//importing necessary models
var Restaurant = require("../models/restaurant");
var Comment = require("../models/comment");

//obj that will hold middleware
var middlewareContainer = {};

middlewareContainer.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You have to login to do that. Please login or create an account.")
	res.redirect("/login");
}

middlewareContainer.isUserTheAuthor = function(req, res, next){
	var id = req.params.id;
	//check if user is logged in
	if(req.isAuthenticated()){
		//find the restaurant you are trying to edit
		Restaurant.findById(id, function(err, restaurantFound){
			if(err){
				req.flash("error", "Restaurant not found");
				res.redirect("back");
			}else{
				//check if the user's id is the same as the restaurant's author's id
				if(restaurantFound.author.id.equals(req.user._id)){
					req.flash("success", "Success! ");
					next();
				}else{
					req.flash("error", "You do not have permission to perform that operation.");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "Please login");
		res.redirect("back");
	}
}

middlewareContainer.isUserTheAuthorComm = function(req, res, next){
	var id = req.params.commentId;
	//check if user is logged in
	if(req.isAuthenticated()){
		//find the comment you are trying to edit
		Comment.findById(id, function(err, commentFound){
			if(err){
				res.redirect("back");
			}else{
				//check if the user's id is the same as the comments's author's id
				if(commentFound.author.id.equals(req.user._id)){
					req.flash("success", "Success! ");
					next();
				}else{
					req.flash("error", "You do not have permission to perform that operation.");
					res.send("You are not the author of this comment.");
				}
			}
		});
	}else{
		req.flash("error", "Please login");
		res.redirect("back");
	}
}

module.exports = middlewareContainer;

