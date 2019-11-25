var express = require('express');
var router = express.Router();
var User = require('../models/user');
var jwt = require('jsonwebtoken');



// Registeration
router.post('/', function(req, res, next) {
    User.create(req.body, (err, user) => {
      console.log(user)
      if (err) return next(err);
      res.json({ user });
      next();
    });
});


// List of users
router.get("/",(req,res,next)=>{
  User.find({},(err,user)=>{
    if(err) return next(err);
    res.json({user})
  })
})

// List of singleuser
router.get("/:id", (req, res, next)=>{
  var id = req.params.id
  User.findById(id, (err, singleuser)=>{
    if (err) return next(err);
    res.json(singleuser);
  })
})


// Login
router.post('/login', function(req, res, next) {
  User.findOne({email: req.body.email}, (err, user) => {
    if(err) return next(err);
    if(!user) return res.send('Enter Valid Email');
    if(!user.verifyPassword(req.body.password)) {
      res.send("InCorrect Password");
    };
    jwt.sign({userId: user._id, email: user.email}, "thisisasecret", (err, token) => {
      if(err) return res.json({success: false, msg: "token not generated"});
      res.json({email: user.email, token, username: user.username, bio: user.bio});
    });
  });
});

module.exports = router;
