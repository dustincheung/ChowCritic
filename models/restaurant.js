//importing mongoose
var mongoose = require("mongoose");

//setting up schema
var restaurantSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	comments:[										 
		{
			type: mongoose.Schema.Types.ObjectId,    //Association, restaurant has an aray of comment id's
			ref: "Comment"
		}
	],
	author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,	 //Associating restaurant with user id
			ref: "User"
		},
		username: String
	}
});

//create a model with this schema so that we can use methods like create, find, etc...
var Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;