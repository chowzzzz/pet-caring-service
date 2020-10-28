var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/', passport.authMiddleware(), function(req, res, next) {
    res.render('profile', { title: 'User Profile', userData: req.user, isSignedIn: req.isAuthenticated() });
})

module.exports = router;