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

//CREATE ROUTE: creates new comment and redirects to restaurants show page
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
					//adding user's id and username to comment object
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();

					//add comment to restaurant and redirect to show page
					restaurant.comments.push(comment);
					restaurant.save();
					res.redirect("/restaurants/" + restaurant._id);
				}
			});
		}
	});
});

//EDIT ROUTE: shows edit form for a specific comment
router.get("/restaurants/:id/comments/:commentId/edit", function(req, res){
	var restaurantId = req.params.id;
	var commentId = req.params.commentId;
	Comment.findById(commentId,function(err, commentFound){
		if(err){
			res.redirect("back");
		}else{
			res.render("comments/edit.ejs", {restaurantId:restaurantId, comment:commentFound});
		}
	});
});

//UPDATE ROUTE: updates specific comment and redirects to restaurant show page
router.put("/restaurants/:id/comments/:commentId", function(req, res){
	var commentId = req.params.commentId;
	var comment = req.body.comment;

	Comment.findByIdAndUpdate(commentId, comment, function(err, updatedComment){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/restaurants/" + req.params.id);
		}
	});
});

//DELETE ROUTE: removes specific comment from db
router.delete("/restaurants/:id/comments/:commentId", function(req, res){
	var commentId = req.params.commentId;
	Comment.findByIdAndRemove(commentId, function(err){
		if(err){
			res.redirect("back");
		}else{
			res.redirect("/restaurants/" + req.params.id)
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