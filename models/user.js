var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt')


var userSchema = new Schema({
        
    username: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        match: /@/,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    bio: {
        type: String,
    },

    image: {
        type: String,
        required: true
    },

    following: {
        type: [String]
    },

    followers: {
        type: [String]
    },

    articleId: {
        type: Schema.Types.ObjectId,
        ref: 'Article'
    },
    
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }

    }, {timestamps: true});

userSchema.pre('save', function(next) {
    this.password = bcrypt.hashSync(this.password, 15);
    next();
});

userSchema.methods.verifyPassword = function(plainpassword) {
    console.log(plainpassword, this.password);
    return bcrypt.compareSync(plainpassword, this.password);
};


var User = mongoose.model("User", userSchema);
module.exports = User;