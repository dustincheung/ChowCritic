//************************************************
//					    SETUP
//************************************************
//imports express framework and body parser which allows us to parse the body of a req
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Camp = require("./models/camp");  			//module export that handles camp schema and model creation
var Comment = require("./models/comment"); 		//module export that handles comment schema and model creation
var seed = require("./seeds"); 					//module export that handles seeding of database	
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
mongoose.connect("mongodb://localhost/yelpCamp");

//sedding database
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

//INDEX ROUTE: shows all camps
app.get("/campsites", function(req, res){
	//retrieve all camps from mongo database, specify no specific attribute (b/c we want all camps)
	//callback function allows us to see if err occurs, and 2nd arg is the camps found in db
	Camp.find({}, function(err, camps){
		if(err){
			console.log(err);
		}else{
			//render campsites view with camps found from db
			res.render("camps/index.ejs", {campsites: camps}); 
		}
	});

});

//NEW ROUTE: shows form to make new camp (calls post campsites post route)
app.get("/campsites/new", function(req, res){
	res.render("camps/new.ejs");
});

//CREATE ROUTE: adds new camp to database and redirects to INDEX ROUTE
//get data from form and add it to array and redirect back to campsite page
app.post("/campsites", function(req, res){
	var name = req.body.name; //parses camp name from req that came from form
	var image = req.body.image; //parses image url from req that came from form
	var description = req.body.description //parses description from req that cam from form
	var campsite = {name: name, image: image, description: description}; //creates new camp obj

	//adding camp obj to db
	Camp.create(campsite, function(err, camp){   
		if(err){
			console.log(err);
		}else{
			res.redirect("/campsites"); //redirects to INDEX ROUTE
		}
	});
});

//SHOW ROUTE: shows info about one camp (make sure this route comes after NEW ROUTE so it doesn't overrwrite)
app.get("/campsites/:id", function(req, res){
	//find camp with specific id
	var id = req.params.id;

	//populate method is used to fill comment arrays w/ actual comments and not just ids
	Camp.findById(id).populate("comments").exec(function(err, campFound){
		if(err){
			console.log(err);
		}else{
			//render show page with this specific camp
			res.render("camps/show.ejs", {camp:campFound})
		}
	});
});

//*************************************************
//					COMMENTS ROUTE
//************************************************
//NESTED ROUTES FOR COMMENT NEW AND CREATE ROUTE

//NEW ROUTE: shows form to make new comments (calls post campsites post route)
app.get("/campsites/:id/comments/new", isLoggedIn, function(req,res){
	var id = req.params.id;

	Camp.findById(id, function(err, camp){
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {camp:camp});
		}
	});
});

app.post("/campsites/:id/comments", isLoggedIn, function(req, res){
	//lookup campsite using id
	var id = req.params.id;

	Camp.findById(id, function(err, camp){
		if(err){
			console.log(err);
			res.redirect("/campsites");
		}else{
			//create a new comment
			Comment.create(req.body.comment, function(err,comment){
				if(err){
					console.log(err);
				}else{
					//add comment to campsite and redirect to show page
					camp.comments.push(comment);
					camp.save();
					res.redirect("/campsites/" + camp._id);
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
			res.redirect("/campsites");
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
		successRedirect: "/campsites", 
		failureRedirect: "/login"
	}), function(req,res){
	res.send("logging in");
});

//handle log out logic
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/campsites");
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
	console.log("BestCamp server is running!");
});