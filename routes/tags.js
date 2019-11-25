var express = require('express');
var router = express.Router();
var Tag = require('../models/tag');

router.get('/', (req, res, next) => {
    Tag.find({}).populate({ path: 'articleId' }).exec((err, tags) => {
        console.log(tags)
        if(err) return res.json({success: false, err});
        if(!tags) return res.json({success: false, msg: "Tag Not Found"});
        return res.json({tags});
        next();
    });
});


module.exports = router;