var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var commentSchema = new Schema({
	body: {
		type: String,
		required: true
	},
	articelId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: "Article",
	},
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User'
	}
}, {timestamps: true})

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;