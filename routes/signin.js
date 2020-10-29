var express = require('express');
var passport = require('passport');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// GET
router.get('/', passport.antiMiddleware(), function(req, res, next) {
	res.render('signin', { title: 'Sign In', isSignedIn: req.isAuthenticated() });
});

// POST
router.post('/', passport.authenticate('local', {
    successRedirect: '/select',
    failureRedirect: '/'
}));

module.exports = router;
