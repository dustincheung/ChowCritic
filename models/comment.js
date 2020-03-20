//importing mongoose
var mongoose = require("mongoose");

//setting up schema
var commentSchema = mongoose.Schema({
	text: String,
	author: String
});

var Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;