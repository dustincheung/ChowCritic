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
		{name: "Hillside", image: "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"},
		{name: "Sunny Creek", image: "https://images.unsplash.com/photo-1500581276021-a4bbcd0050c5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"},
		{name: "Grassy Bend", image: "https://images.unsplash.com/photo-1492648272180-61e45a8d98a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"},
		{name: "Sunny Creek", image: "https://images.unsplash.com/photo-1496947850313-7743325fa58c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"},
		{name: "Grassy Bend", image: "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"},
		{name: "Hillside", image: "https://images.unsplash.com/photo-1445308394109-4ec2920981b1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"}];

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