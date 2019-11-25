var express = require('express');
var router = express.Router();
var Article = require('../models/article');
var User = require('../models/user');
var Comment = require('../models/comment');
var auth = require('../middleware/auth');
var Tag = require('../models/tag');
var logged = auth.validatetoken;


// List of Articles
router.get('/', logged, (req, res, next) => {
    Article.find({}).populate("author","-password").exec((err, articlelist) => {
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
    req.body.userId = req.user.userId;
    Article.create(req.body, (err, createdarticle) => {
        if(err) return next(err);
        if(!createdarticle) return res.json({success:false, msg: "Article not found"});
        createdarticle.tagList.forEach(tag => {
            Tag.findOne({tagText: tag}, (err, foundtag) => {
                if(!foundtag) {
                    Tag.create({articleId: createdarticle._id,tagText: tag}, (err, createdtag) => {
                        if(err) return next(err);
                        if(!createdtag) return res.json({success:false, msg: "Cannot create tag"});
                    })
                } else if (foundtag){
                    Tag.findByIdAndUpdate(foundtag._id, {$push:{articleId: createdarticle._id}},{new: true},(err, updatedtag) => {
                        if(err) return next(err);         
              })
                }
            })
        })
        res.json({success:true, createdarticle});

    })
})


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
router.post("/:slug/favorite", (req, res, next) => {
    let slug = req.params.slug;
    console.log(req.user);
    Article.findOne({ slug }, (err, article) => {
      if (err) return next(err);
      if (!article) return res.json({ success: false, message: "No article Found!" });
      Article.findOneAndUpdate({ slug }, { $push: { favorites: req.user.userId } },{new:true}, (err, favoritedArticle) => {
          if (err) return next(err);
          favoritedArticle.favoritesCount++;
          User.findOneAndUpdate({ username: req.user.username }, { $push: { favorited: article._id } },{new:true}, (err, favoritedUser) => {
              if (err) return next(err);
              res.json({ favoritedArticle, favoritedUser });
            }
          );
        }
      );
    });
  });

// UnFavorite an article.
// router.delete('/:slug/favorite', (req, res, next) => {
//     var slug = req.params.slug;
//     Article.findOne({slug}, (err, article) => {
//         if(err) return res.json({success: false, err});
//         if(!article) return res.json({msg: "No article found"});
//         Article.findByIdAndUpdate(article._id, {$pull: {favorites: req.userId}}, {new: true}, (err, updatedArticle) => {
//             if(err) return res.json({success: false, err});
//             User.findByIdAndUpdate(req.userId, {$pull: {favorited: article._id}}, {new: true}, (err, updatedUser) => {
//                 if(err) return res.json({success: false, err});
//                 return res.json({success: true, updatedArticle, updatedUser});
//             });
//         });
//     });
// });

// feed - Article feed by the users you following
router.get("/feed", (req,res) => {
    User.findById(req.user.userId, (err,user) => {
        if(err) return res.json({err});
        user.following.forEach(e => {
            Article.find({userId: e}, (err,feed) => {
                if(err) return res.json({err});
                res.json({feed});
            })
        })
    })
})

module.exports = router;