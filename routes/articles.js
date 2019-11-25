var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var User = require('../models/user');
var Comment = require('../models/comment');
var auth = require('../middleware/auth');
var logged = auth.validatetoken;


// List of Articles
router.get('/', logged, (req, res, next) => {
    Article.find({}).populate("userId", "username email bio image").exec((err, articlelist) => {
        if(err) return next(err);
        res.json({articlelist});
    });
});

// Get single article
router.get('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug}, (err, singlearticle) => {
        if(err) return next(err);
        res.json(singlearticle);
        next();
    });
});

router.use(auth.validatetoken);

// Creating newArticle.
router.post('/', (req, res, next) => {
    req.body.userId = req.userId;
    Article.create(req.body, (err, newArticle) => {
        if(err) return res.json({msg: "Err while creating new article", err});
        // Creating Tags.
        if(newArticle.tag) {
            var tagArr = newArticle.tag.split(',');
            tagArr.forEach(e => {
                Tag.findOne({tags: e.trim()}, (err, existingTag) => {
                    if(err) return res.json({msg: "Err while finding tag."});
                    if(!existingTag) {
                        Tag.create({articleId: [newArticle.id], tags: e.trim()}, (err, tag) => {
                            if(err) return res.json({msg: "Err while creating tag."});
                        });
                    } else if(existingTag) {
                        Tag.findByIdAndUpdate(existingTag.id, {$push: {articleId: newArticle.id}}, {new: true}, (err, updatedTag) => {
                            if(err) return res.json({msg: "Err while updating tag."});
                        });
                    }
                });
            });
        };

        User.findOneAndUpdate({_id: newArticle.userId}, {$push: {articlesId: newArticle.id}}, {new: true, upsert: false}, (err, updatedUser) => {
            if(err) return res.json({msg: "Err while updating user with array of article id", err});
            return res.json({msg: "User update successfull", newArticle});
        });
    });
});



// Update an existing article.
router.put('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    var loggedInUser = req.userId;
    Article.findOne({slug}, (err, article) => {
        if(err) return res.json({success: false, err});
        if(loggedInUser == article.userId) {
            Article.findOneAndUpdate({slug}, req.body, {new: true}, (err, updatedArticle) => {
                if(err) return res.json({success: false, err});
                return res.json({updatedArticle});
            });
        } else {
            return res.json({msg: "You can't edit this post"});
        }
    });
});

// Delete an article.
router.delete('/:slug', (req, res, next) => {
    var slug = req.params.slug;
    var loggedInUser = req.userId;
    Article.findOne({slug}, (err, article) => {
        if(err) return res.json({success: false, err});
        if(!article) return res.json({msg: "Deleted Successfully"});
        if(loggedInUser == article.userId) {
            Article.findOneAndDelete({slug}, (err, deletedArticle) => {
                if(err) return res.json({success: false, err});
                if(article.commentsId.length) {
                    Comment.find({articleId: article._id}, (err, comments) => {
                        if(err) return res.json({success: false, err});
                        if(comments.length) {
                            comments.forEach(e => {
                                Comment.findByIdAndDelete(e, (err, deletedComments) => {
                                    if(err) return res.json({success: false, err});
                                    return res.json({success: true});
                                });
                            });
                        } else {
                            return res.json({success: true, msg: "No comments to delete"});
                        }
                    });
                } else {
                    return res.json({success: true, msg: "No comments at all"});
                }
            });
        } else {
            return res.json({msg: "You can't delete this post"});
        }
    });
});


// Comments

// Create a comment
router.post('/:slug/comments', (req, res, next) => {
    Comment.create(req.body, (err, comment) => {
        if(err) return next(err);
        res.json(comment);
    });
});

// Get comments
router.get('/:slug/comments', (req, res, next) => {
    Comment.find({}, (err, comments) => {
        if(err) return new(err);
        res.json({comments});
        next();
    });
});

// Get commeny by id
router.get('/:slug/comments/:id', (req, res, next) => {
    Comment.findById(req.params.id, (err, comment)=>{
        if(err) return next(err);
        res.json({comment});
        next();
    });
});

// Update A Comment
router.put('/:slug/comments/:id', (req, res, next) => {
    Comment.findByIdAndUpdate(req.params.id, req.body, (err, comment) =>{
        if(err) return next(err);
        res.json({comment});
        next();
    });
});

// Delete A Comment
router.delete('/:slug/comments/:id', (req, res, next) => {
    Comment.findByIdAndDelete(req.params.id, (err, comment) => {
         if(err) return next(err);
         res.json({success:true, msg: "Comment Deleted Successfully"});
         next();
    });
});

// Favourite Article.
router.post('/:slug/favorite', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug}, (err, article) => {
        if(err) return res.json({success: false, err});
        if(!article) return res.json({msg: "No article found"});
        Article.findByIdAndUpdate(article._id, {$push: {favorites: req.userId}}, {new: true}, (err, updatedArticle) => {
            if(err) return res.json({success: false, err});
            User.findByIdAndUpdate(req.userId, {$push: {favorited: article._id}}, {new: true}, (err, updatedUser) => {
                if(err) return res.json({success: false, err});
                return res.json({success: true, updatedArticle, updatedUser});
            });
        });
    });
});

// UnFavorite an article.
router.delete('/:slug/favorite', (req, res, next) => {
    var slug = req.params.slug;
    Article.findOne({slug}, (err, article) => {
        if(err) return res.json({success: false, err});
        if(!article) return res.json({msg: "No article found"});
        Article.findByIdAndUpdate(article._id, {$pull: {favorites: req.userId}}, {new: true}, (err, updatedArticle) => {
            if(err) return res.json({success: false, err});
            User.findByIdAndUpdate(req.userId, {$pull: {favorited: article._id}}, {new: true}, (err, updatedUser) => {
                if(err) return res.json({success: false, err});
                return res.json({success: true, updatedArticle, updatedUser});
            });
        });
    });
});

// // feed - Article feed by the users you following
// router.get("/feed", (req,res) => {
//     User.findById(req.user.userId, (err,user) => {
//         if(err) return res.json({err});
//         user.following.forEach(e => {
//             Article.find({userId: e}, (err,feed) => {
//                 if(err) return res.json({err});
//                 res.json({feed});
//             })
//         })
//     })
// })

module.exports = router;