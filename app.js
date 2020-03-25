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

//importing routes
var restaurantRoutes = require("./routes/restaurants");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

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