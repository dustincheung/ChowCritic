//importing mongoose
var mongoose = require("mongoose");

//setting up schema
var restaurantSchema = new mongoose.Schema({
	name: String,
	image: String,
	description: String,
	comments:[		
		{
			type: mongoose.Schema.Types.ObjectId,    //Association, camps have an aray of comment id's
			ref: "Comment"
		}
	]
});

//create a model with this schema so that we can use methods like create, find, etc...
var Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;