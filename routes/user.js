var express = require('express');
var router = express.Router();
var User = require('../models/user');
var auth = require('../middleware/auth');
var logged = auth.validatetoken;

router.use(auth.validatetoken);


// Get Current User
router.get("/",(req,res,next)=>{
    User.findById(req.user.userId,(err,user)=>{
        if(err) return next(err);
        res.json({user});
        next();
    });
});

// Update Current User
router.put("/",(req,res,next)=>{
    User.findByIdAndUpdate(req.user.userId, req.body, {new:true}, (err,user) => {
        if(err) return next(err);
        res.json({user});
        next();
    });
});

module.exports = router;