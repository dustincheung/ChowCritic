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

//executable
var app = express();

//tell app to use
app.use(bodyParser.urlencoded({extended: true}));

//connecting to mongodb database, if it doesn't exist yet it will create it
mongoose.connect("mongodb://localhost/yelpCamp");

//sedding database
seed();

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
			res.render("index.ejs", {campsites: camps}); //render campsites view with camps found from db
		}
	});

});

//NEW ROUTE: shows form to make new camp (calls post campsites post route)
app.get("/campsites/new", function(req, res){
	res.render("new.ejs");
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

	Camp.findById(id, function(err, campFound){
		if(err){
			console.log(err);
		}else{
			//render show page with this specific camp
			res.render("show.ejs", {camp:campFound})
		}
	});
});

//************************************************
//					    SERVER
//************************************************
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("BestCamp server is running!");
});