//importing mongoose
var mongoose = require("mongoose");

//setting up schema
var campSchema = new mongoose.Schema({
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
var Camp = mongoose.model("Camp", campSchema);

module.exports = Camp;