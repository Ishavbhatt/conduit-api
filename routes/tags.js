var express = require('express');
var router = express.Router();
var Tag = require('../models/tag');

router.get('/', (req, res, next) => {
    Tag.find({}).populate({ path: 'articleId', populate: {path: 'userId'} }).exec((err, tagList) => {
        console.log(tagList)
        if(err) return res.json({success: false, err});
        if(!tagList) return res.json({success: false, msg: "Tag Not Found"});
        return res.json({tagList});
        next();
    });
});


module.exports = router;