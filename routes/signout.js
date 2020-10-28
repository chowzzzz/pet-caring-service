var express = require('express');
var passport = require('passport');
var router = express.Router();

// GET
router.get('/', passport.authMiddleware(), function (req, res, next) {
	req.session.destroy()
	req.logout()
	res.redirect('/')
});

module.exports = router;