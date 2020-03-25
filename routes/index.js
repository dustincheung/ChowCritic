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

//handle sign up logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			console.log(err);
			res.render("register.ejs");
		}
		passport.authenticate("local")(req, res, function(){
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
	res.redirect("/restaurants");
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