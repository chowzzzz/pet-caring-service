var express = require('express');
var router = express.Router();

const { Pool } = require('pg')
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
var sql_query = 'INSERT INTO users VALUES';

// GET
router.get('/', function(req, res, next) {
	res.render('signup', { title: 'Sign Up' });
});

// POST
router.post('/', function(req, res, next) {
	// Retrieve Information
	var username  = req.body.username;
	var name = req.body.name;
	var email = req.body.email;
	var password = req.body.password;
	var gender = req.body.gender;
	var address = req.body.address;
	
	// Construct Specific SQL Query
	var insert_query = sql_query + "('" + username + "','" + name + "','" + email + "','" + password + "','" + gender + "','" + address + "')";
	
	pool.query(insert_query, (err, data) => {
		//res.redirect('/select')
	});
});

module.exports = router;
