//requiring express
var express = require("express");

//new instance of router where all routes will be added to
var router = express.Router();

//importing necessary models
var passport = require("passport");
var User = require("../models/user");

//************************************************
//				  RESTFUL ROUTES
//************************************************

//HOME ROUTE
router.get("/", function(req, res){
	res.render("landing.ejs");
});

//************************************************
//					AUTH ROUTES
//************************************************

//shows user registration form
router.get("/register", function(req, res){
	res.render("register.ejs");
});

//handle registering user logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome to ChowCritic " + user.username + "!");
			res.redirect("/restaurants");
		})
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("login.ejs");
});

//handle log in logic, middleware authenticates user and redirects accordingly
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/restaurants", 
		failureRedirect: "/login"
	}), function(req,res){
	res.send("logging in");
});

//handle log out logic
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You are now logged out.")
	res.redirect("/restaurants");
});

//export routers
module.exports = router;