var express = require('express');
var router = express.Router();

/* Connect to DB */
const { Pool } = require("pg");
const { connect } = require('./admin');
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

/* SQL Query */
const allPetByUserQuery = `SELECT * FROM pet WHERE username = 'Udall';`;

/* GET pet owner page. */
router.get('/', function(req, res, next) {
  pool.query(allPetByUserQuery, (err, pets) => {
    if (err) {
      console.error(err);
    }

    res.render("petowner", {
      title: "Pet Owner",
      pets: pets.rows,
      isSignedIn: req.isAuthenticated()
    });
  });  
});

module.exports = router;