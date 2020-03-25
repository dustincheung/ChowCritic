//importing mongoose
var mongoose = require("mongoose");

//setting up schema
var commentSchema = mongoose.Schema({
	text: String,
	author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,     //associating a user with a comment
			ref: "User"
		},
		username: String							  //we use a field username so that we do not have to search for username 
	}												  //using an user id
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;