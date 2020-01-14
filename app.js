//************************************************
//					    SETUP
//************************************************
//require packages
var express = require("express");
var bodyParser = require("body-parser");

//executable
var app = express();

//tell app to use
app.use(bodyParser.urlencoded({extended: true}));

var campsites = [
		{name: "Hillside", image: "https://pixabay.com/get/57e8d1464d53a514f6da8c7dda793f7f1636dfe2564c704c722773dd924ec65c_340.jpg"},
		{name: "Sunny Creek", image: "https://pixabay.com/get/55e8dc404f5aab14f6da8c7dda793f7f1636dfe2564c704c722773dd924ec65c_340.jpg"},
		{name: "Grassy Bend", image: "https://pixabay.com/get/57e8d0424a5bae14f6da8c7dda793f7f1636dfe2564c704c722773dd924ec65c_340.jpg"}];

//************************************************
//					    ROUTES
//************************************************
//routes
app.get("/", function(req, res){
	res.render("landing.ejs");
});

//campsites route
app.get("/campsites", function(req, res){
	res.render("campsites.ejs", {campsites: campsites});
});

//campsites creation form route that makes a post request to campsites post route
app.get("/campsites/new", function(req, res){
	res.render("new.ejs");
});

//post route (named it the same as get route b/c it follows REST convention)
//get data from form and add it to array and redirect back to campsite page
app.post("/campsites", function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var campsite = {name: name, image: image};
	campsites.push(campsite);
	res.redirect("/campsites"); //redirect defaults to get route
});

//************************************************
//					    SERVER
//************************************************
var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("BestCamp server is running!");
});