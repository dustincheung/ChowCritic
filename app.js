//loads environmental variables from a .env file, allows keys to persist each time you restart terminal
require("dotenv").config();

//************************************************
//					    SETUP
//************************************************
var express = require("express");					
var bodyParser = require("body-parser");			
var mongoose = require("mongoose");	
var mthdOverride = require("method-override");				
var connectFlash = require("connect-flash");

//created environmental variable DATABASEURL that changes based on which environment you are on 
//DATABASEURL changes when you are running locally (local mongodb db instance)
//DATABASEURL changes when you are running remote instance on heroku (online instance of mongodb db hosted on mongolab)
//env var for local can be changed via command line, and for heroku online in app settings
console.log(process.env.DATABASEURL);
mongoose.connect(process.env.DATABASEURL);

//db models and shema setup
var Restaurant = require("./models/restaurant");  	
var Comment = require("./models/comment"); 	
var User = require("./models/user");		
var seed = require("./seeds"); 							

//authorization imports
var passport = require("passport");
var LocalStrategy = require("passport-local");

//importing routes
var restaurantRoutes = require("./routes/restaurants");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

//executable
var app = express();

//tell app to use body parser
app.use(bodyParser.urlencoded({extended: true}));

//tell app to use method override, necessary for update/destroy routes (all post routes) 
//this allows us to distinguish update and destory methods by appending _method in route calls
app.use(mthdOverride("_method"));

//tell app to serve style sheet directories
app.use(express.static(__dirname + "/public"));


//tell app to use flash alerts
app.use(connectFlash());

//seeding database
//seed();

//configuring passport and telling app to use express session
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

//middleware: instead of passing in req.user into every ejs template, we can call currUser in every template
app.use(function(req, res, next){
	res.locals.currUser = req.user; //for every ejs template currUser will = req.user
	res.locals.success = req.flash("success"); //defaulted vars for success/error messages
	res.locals.error = req.flash("error");  
	next(); //continues code
});

//tell app to use route files
app.use(restaurantRoutes);
app.use(commentRoutes);
app.use(indexRoutes);

//************************************************
//					    SERVER
//************************************************
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("ChowCritic server is running!");
});