var express = require('express');
var auth = require('../middleware/auth');
var User = require('../models/user');
var router = express.Router();

router.use(auth.validatetoken);


// Get User Profile
router.get('/:username', (req, res, next) => {
    let username = req.params.username;
    User.findOne({username}).populate({
        path: 'articleId',
        populate: {
            path: 'userId'
        }
    }).exec((err, user) => {
        if(err) return res.json({success: false, err});
        return res.json({user});
    });
});

// Follow User
router.post("/:username/follow",(req,res)=>{
    var username=req.params.username;
    User.findOne({username},(err,user)=>{
        if(err) return res.json({err});
        if(!user.followers.includes(req.user.username)){
            User.findOneAndUpdate({username},{$push : {followers : req.user.username}},{new: true},(err,followinguser)=>{
                if(err) return res.json({err});
                User.findByIdAndUpdate(req.user.userId,{$push : {following:followinguser.username}},{new: true},(err,currentuser)=>{
                    if(err) return res.json({err});
                    res.json({currentuser,followinguser});
                });
            });
        } else {
            res.json(user);
        }

    });
});


// UnFollow User
router.delete("/:username/follow",(req,res)=>{
    var username=req.params.username;
    User.findOne({username},(err,user)=>{
        if(err) return res.json({err});
        if(user.followers.includes(req.user.username)){
            User.findOneAndUpdate({username},{$pull : {followers : req.user.username}},{new: true},(err,unfollowinguser)=>{
                if(err) return res.json({err});
                User.findByIdAndUpdate(req.user.userId,{$pull : {following: unfollowinguser.username}},{new: true},(err,currentuser)=>{
                    if(err) return res.json({err});
                    res.json({currentuser, unfollowinguser})

                });
            });
        }   else {
            res.json(user);

        }}
 

    );
});

module.exports = router;