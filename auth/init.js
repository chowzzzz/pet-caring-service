const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const authMiddleware = require('./middleware');
const antiMiddleware = require('./antimiddle');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

var userpass_query = 'SELECT * FROM appuser WHERE username = $1';

function findUser (username, callback) {
	pool.query(userpass_query, [username], (err, data) => {
		if(err) {
			return callback(null);
		}
		
		if(data.rows.length == 0) {
			return callback(null)
		} else if(data.rows.length == 1) {
			return callback(null, {
				username    : data.rows[0].username,
				passwordHash: data.rows[0].password,
			});
		} else {
			return callback(null);
		}
	});
}

passport.serializeUser(function (user, callback) {
  callback(null, user.username);
})

passport.deserializeUser(function (username, callback) {
  findUser(username, cb);
})

function initPassport () {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      findUser(username, (err, user) => {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        if (password != user.passwordHash) {
            return done(null, false);
        }

        return done(null, user);

        /* IF WANNA USE HASH
        bcrypt.compare(password, user.passwordHash, (err, isValid) => {
          if (err) {
            return done(err);
          }

          if (!isValid) {
            console.log(user.passwordHash);
            return done(null, false);
          }
        
          console.log('ip-Password matches!');
          return done(null, user);
        }) */
      })
    }
  ));

  passport.authMiddleware = authMiddleware;
  passport.antiMiddleware = antiMiddleware;
  passport.findUser = findUser;
}

module.exports = initPassport;