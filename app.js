//************************************************
//					    SETUP
//************************************************
//imports express framework and body parser which allows us to parse the body of a req
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Restaurant = require("./models/restaurant");  	//module export that handles restaurant schema and model creation
var Comment = require("./models/comment"); 			//module export that handles comment schema and model creation
var seed = require("./seeds"); 						//module export that handles seeding of database	
var passport = require("passport");
var LocalStrategy = require("passport-local");
var User = require("./models/user");

//executable
var app = express();

//tell app to use body parser
app.use(bodyParser.urlencoded({extended: true}));
//tell app to serve style sheet directories
app.use(express.static(__dirname + "/public"));

//connecting to mongodb database, if it doesn't exist yet it will create it
mongoose.connect("mongodb://localhost/chowCritic");

//seeding database
seed();

//configuring passport
app.use(require("express-session")({
	secret: "dustincnj",
	resave: false,
	saveUnitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware: instead of passing in currUser: req.user in every render use:
app.use(function(req, res, next){
	res.locals.currUser = req.user; //for every ejs template currUser will = req.user
	next(); //continues code
});

//************************************************
//				  RESTFUL ROUTES
//************************************************

//HOME ROUTE
app.get("/", function(req, res){
	res.render("landing.ejs");
});

//INDEX ROUTE: shows all restaurants
app.get("/restaurants", function(req, res){
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
app.get("/restaurants/new", function(req, res){
	res.render("restaurants/new.ejs");
});

//CREATE ROUTE: adds new restaurant to database and redirects to INDEX ROUTE
//get data from form and add it to array and redirect back to restaurant page
app.post("/restaurants", function(req, res){
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
app.get("/restaurants/:id", function(req, res){
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

//*************************************************
//					COMMENTS ROUTE
//************************************************
//NESTED ROUTES FOR COMMENT NEW AND CREATE ROUTE

//NEW ROUTE: shows form to make new comments (calls post restaurants post route)
app.get("/restaurants/:id/comments/new", isLoggedIn, function(req,res){
	var id = req.params.id;

	Restaurant.findById(id, function(err, restaurant){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {restaurant:restaurant});
		}
	});
});

app.post("/restaurants/:id/comments", isLoggedIn, function(req, res){
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

//************************************************
//					AUTH ROUTES
//************************************************

//shows user registration form
app.get("/register", function(req, res){
	res.render("register.ejs");
});

//handle sign up logic
app.post("/register", function(req, res){
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
app.get("/login", function(req, res){
	res.render("login.ejs");
});

//handle log in logic, middleware authenticates user and redirects accordingly
app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/restaurants", 
		failureRedirect: "/login"
	}), function(req,res){
	res.send("logging in");
});

//handle log out logic
app.get("/logout", function(req, res){
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

//************************************************
//					    SERVER
//************************************************
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("ChowCritic server is running!");
});