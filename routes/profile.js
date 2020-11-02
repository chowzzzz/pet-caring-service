var express = require('express');
var passport = require('passport');
var router = express.Router();

/* Connect to DB */
const { Pool } = require("pg");
const { connect } = require('./admin');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

/* SQL Query */
const userDetailsQuery = "SELECT * FROM appuser WHERE username = $1;";

const allPetByUserQuery = "SELECT * FROM pet WHERE username = $1;";

const currentReservationsQuery = "SELECT * FROM job WHERE pousername = $1;";

/* GET pet owner page. */
router.get('/', passport.authMiddleware(), function (req, res, next) {
  pool.query(userDetailsQuery, [req.user.username], (err, details) => {
    if (err) {
      console.error(err);
    }
    pool.query(allPetByUserQuery, [req.user.username], (err, pets) => {
      if (err) {
        console.error(err);
      }
      pool.query(currentReservationsQuery, [req.user.username], (err, reservations) => {
        if (err) {
          console.error(err);
        }
          res.render("profile", {
          title: "Pet Owner",
          details: details.rows,
          pets: pets.rows,
          reservations: reservations.rows,
          isSignedIn: req.isAuthenticated()
        });
      });
    });
  });
});

module.exports = router;