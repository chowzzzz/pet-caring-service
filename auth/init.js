const sql_query = require("../sql");

const passport = require("passport");
// const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

var authMiddleware = require("./middleware");
var antiMiddleware = require("./antimiddle");
var verifyAdmin = require("./verifyadmin");

// Postgre SQL Connection
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

function findUser(username, callback) {
  pool.query(sql_query.query.signin_query, [username], (err, data) => {
    if (err) {
      console.error("Cannot find user");
      return callback(null);
    }

    if (data.rows.length == 0) {
      console.error("User does not exist");
      return callback(null);
    } else if (data.rows.length == 1) {
      return callback(null, {
        userType: "User",
        username: data.rows[0].username,
        name: data.rows[0].name,
        email: data.rows[0].email,
        password: data.rows[0].password,
        joindate: data.rows[0].joindate,
        gender: data.rows[0].gender,
        address: data.rows[0].address,
        dateofbirth: data.rows[0].dateofbirth
      });
    } else {
      console.error("Duplicate users");
      return callback(null);
    }
  });
}

function findAdmin(username, callback) {
  pool.query(sql_query.query.adminsignin_query, [username], (err, data) => {
    if (err) {
      console.error("Cannot find admin");
      return callback(null);
    }

    if (data.rows.length == 0) {
      console.error("Admin does not exist");
      return callback(null);
    } else if (data.rows.length == 1) {
      return callback(null, {
        userType: "Admin",
        username: data.rows[0].username,
        name: data.rows[0].name,
        email: data.rows[0].email,
        password: data.rows[0].password,
        joindate: data.rows[0].joindate
      });
    } else {
      console.error("Duplicate admins");
      return callback(null);
    }
  });
}

passport.serializeUser(function (user, callback) {
  key = {
    username: user.username,
    usertype: user.userType
  }

  callback(null, key);
});

passport.deserializeUser(function (key, callback) {
  if (key.usertype == 'User') {
    findUser(key.username, callback);
  } else {
    findAdmin(key.username, callback);
  }
});

function initPassport() {
  passport.use('user-local',
    new LocalStrategy((username, password, done) => {
      findUser(username, (err, user) => {
        if (err) {
          return done(err);
        }

        // User not found
        if (!user) {
          console.error("User not found");
          return done(null, false);
        }

        /* IF WE'D LIKE TO USE BCRYPT (MAKE SURE PASSWORD IS HASHED BEFORE STORED), MIGHT WANT TO ADD SALT
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

        // Incorrect password
        if (password != user.password) {
          console.error("Incorrect password");
          return done(null, false);
        }

        return done(null, user);
      });
    })
  );

  passport.use('admin-local',
    new LocalStrategy((username, password, done) => {
      findAdmin(username, (err, user) => {
        if (err) {
          return done(err);
        }

        // User not found
        if (!user) {
          console.error("Admin not found");
          return done(null, false);
        }

        // Incorrect password
        if (password != user.password) {
          console.error("Incorrect password");
          return done(null, false);
        }

        return done(null, user);
      });
    })
  );

  passport.authMiddleware = authMiddleware;
  passport.antiMiddleware = antiMiddleware;
  passport.verifyAdmin = verifyAdmin;
  passport.findUser = findUser;
  passport.findAdmin = findAdmin;
}

module.exports = initPassport;
