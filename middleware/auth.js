var jwt = require("jsonwebtoken");

exports.validatetoken = (req, res, next) => {
    var token = req.headers.authorization;
    if(token) {
        jwt.verify(token, "thisisasecret", (err, payload) => {
            if(err) return res.status(400).json({success: false, msg: "Something Went Wrong"});
            req.user = payload;
            var user = req.user;
            console.log(user);
            next();
        });
    } else {
        res.status(401).json({error: 'Token is Required'});
    }
}