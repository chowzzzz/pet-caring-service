var express = require('express');
var router = express.Router();
var passport = require('passport');

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// GET
router.get('/', function(req, res, next) {
	res.render('signin', { title: 'Sign In' });
});

// POST
router.post('/', passport.authenticate('local', {
    successRedirect: '/select',
    failureRedirect: '/about'
}));

module.exports = router;
