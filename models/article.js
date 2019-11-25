var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var slug = require("slug");


var articleSchema = new Schema({
title: {
  type: String,
  required: true
},

description: {
  type: String,
  required: true
},

body: {
      type: String
},

slug: {
      type: String
},

tagList: [{
      type: String
}],

favorite:{
    type:Boolean
},

favoriteCount:{
    type:Number,
    default:0
},

author:{
    type:Schema.Types.ObjectId,
    ref: "User"
},

comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  },

favorites: {
    type: [Schema.Types.ObjectId],
    ref: "User"
},

commentId: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
},

userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
}

}, {timestams: true});



articleSchema.pre('save', function(next) {
    if(this.title && this.isModified('title')){
        var slugged = slug(this.title, {lower: true});
        console.log(slugged);
        this.slug = slugged;
        next();
    } else {
        next();
    };
})

var Article = mongoose.model("Article", articleSchema);
module.exports = Article;