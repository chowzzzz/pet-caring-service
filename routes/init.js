const sql_query = require("../sql");
const passport = require("passport");
// const bcrypt = require("bcrypt");

// PostgreSQL Connection
const { Pool } = require("pg");
const sql = require("../sql");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Define routes here
function initRouter(app) {
  /* GET */
  app.get("/", (req, res, next) => {
    res.render("index", {
      title: "Express",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.get("/about", (req, res, next) => {
    res.render("about", {
      title: "About",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.get("/search", search);

  /* AUTHENTICATED GET */
  app.get("/users", passport.authMiddleware(), users);

  app.get(
    "/petOwner-profile",
    passport.authMiddleware(),
    passport.verifyNotAdmin(),
    petOwnerProfile
  );

  app.get(
    "/admin-profile",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminProfile
  );
  app.get(
    "/admin-dashboard",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminDashboard
  );

  app.get(
    "/admin-user",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminUser
  );
  app.get(
    "/admin-caretaker",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminCaretaker
  );
  app.get(
    "/admin-petowner",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminPetowner
  );
  app.get(
    "/admin-pet",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminPet
  );
  app.get(
    "/admin-job",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminJob
  );
  app.get(
    "/admin-profiles",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    adminProfiles
  );

  /* POST */
  app.post("/search", passport.antiMiddleware(), searchCaretaker);

  /* AUTHENTICATED POST */
  app.post("/editAdmin", passport.authMiddleware(), editAdmin);

  /* SIGNUP */
  app.get("/signup", passport.antiMiddleware(), function (req, res, next) {
    res.render("signup", {
      title: "Sign Up",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.post("/signup", passport.antiMiddleware(), registerUser);

  /* REGISTER CREDIT CARD */
  app.get("/petOwner-creditCard", passport.authMiddleware(), function (req, res, next) {
    res.render("petOwner-creditCard", {
      title: "Register Credit Card",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.post("/petOwner-creditCard", passport.antiMiddleware(), registerCreditCard);

  /* SIGNIN */
  app.get("/signin", passport.antiMiddleware(), (req, res, next) => {
    res.render("signin", {
      title: "Sign In",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.post(
    "/signin",
    passport.authenticate("user-local", {
      successRedirect: "/users",
      failureRedirect: "/signin",
    })
  );

  /* SIGNOUT */

  app.get("/signout", passport.authMiddleware(), function (req, res, next) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
  });

  /* ADMINISTRATOR SIGN-IN */
  app.get("/admin-signin", passport.antiMiddleware(), (req, res, next) => {
    res.render("admin-signin", {
      title: "Administrator Sign In",
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });

  app.post(
    "/admin-signin",
    passport.authenticate("admin-local", {
      successRedirect: "/admin-dashboard",
      failureRedirect: "/admin-signin",
    })
  );

  /* ADMINISTRATOR CREATE NEW */
  app.get(
    "/admin-createnew",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    function (req, res, next) {
      res.render("adminCreateNew", {
        title: "Create New Administrator",
        isSignedIn: req.isAuthenticated(),
        isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
      });
    }
  );

  app.post(
    "/admin-createnew",
    passport.authMiddleware(),
    passport.verifyAdmin(),
    registerAdmin
  );
}

// Define functions to get your data + routes here if its too long in the intiRouter() function
// GET
function users(req, res, next) {
  pool.query(sql_query.query.all_users, (err, data) => {
    res.render("users", {
      title: "Data",
      data: data.rows,
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });
}

function petOwnerProfile(req, res, next) {
  const username = req.user.username;
  pool.query(
    sql_query.query.get_user,
    [username], (err, details) => {
      if (err) {
        console.error(err);
      }
      pool.query(
        sql_query.query.all_pets,
        [username], (err, pets) => {
          if (err) {
            console.error(err);
          }
          pool.query(
            sql_query.query.petowner_job,
            [username],
            (err, reservations) => {
              if (err) {
                console.error(err);
              }
              pool.query(
                sql_query.query.petowner_creditCard,
                [username],
                (err, creditcard) => {
                  if (err) {
                    console.error(err);
                  }
                  res.render("petOwner-profile", {
                    title: "Pet Owner",
                    details: details.rows,
                    pets: pets.rows,
                    reservations: reservations.rows,
                    creditcard: creditcard.rows,
                    isSignedIn: req.isAuthenticated(),
                    isAdmin: req.isAuthenticated()
                      ? req.user.userType == "Admin"
                      : false,
                  });
                });
            });
        });
    });
}

function adminDashboard(req, res, next) {
  pool.query(sql_query.query.monthly_job, (err, monthlyJob) => {
    if (err) {
      console.error(err);
    }
    pool.query(sql_query.query.top_caretakers, (err, topCaretakers) => {
      if (err) {
        console.error(err);
      }
      pool.query(sql_query.query.job_performance, (err, jobPerformance) => {
        if (err) {
          console.error(err);
        }
        pool.query(
          sql_query.query.underperforming_ct,
          (err, underperformingCt) => {
            if (err) {
              console.error(err);
            }
            let username = topCaretakers.rows.map((a) => a.username);
            let totalAmount = topCaretakers.rows.map((a) => a.totalamount);

            let month = jobPerformance.rows.map((a) => a.month);
            let amountpaid = jobPerformance.rows.map((a) => a.amountpaid);
            console.log(amountpaid);
            res.render("adminDashboard", {
              title: "Admin Dashboard",
              monthly_job: monthlyJob.rows,
              username: username,
              totalAmount: totalAmount,
              month: month,
              amountpaid: amountpaid,
              underperformingCt: underperformingCt.rows,
              isSignedIn: req.isAuthenticated(),
              isAdmin: req.isAuthenticated()
                ? req.user.userType == "Admin"
                : false,
            });
          }
        );
      });
    });
  });
}

function adminUser(req, res, next) {
  res.render("adminUser", {
    title: "Users",
    isSignedIn: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
  });
}

function adminCaretaker(req, res, next) {
  res.render("adminCaretaker", {
    title: "Caretakers",
    isSignedIn: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
  });
}

function adminPetowner(req, res, next) {
  res.render("adminPetowner", {
    title: "Pet owners",
    isSignedIn: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
  });
}

function adminPet(req, res, next) {
  res.render("adminPet", {
    title: "Pets",
    isSignedIn: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
  });
}

function adminJob(req, res, next) {
  res.render("adminJob", {
    title: "Jobs",
    isSignedIn: req.isAuthenticated(),
    isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
  });
}

function adminProfiles(req, res, next) {
  pool.query(sql_query.query.get_admins, (err, data) => {
    res.render("admin-profiles", {
      title: "Admin Profiles",
      data: data.rows,
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });
}

function adminProfile(req, res, next) {
  const username = req.query.username ? req.query.username : req.user.username;
  pool.query(sql_query.query.get_admin, [username], (err, data) => {
    res.render("adminProfile", {
      title: "Admin Profile",
      data: data.rows,
      isSignedIn: req.isAuthenticated(),
      isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
    });
  });
}

// POST
function registerUser(req, res, next) {
  const username = req.body.username;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const gender = req.body.gender;
  const address = req.body.address;
  const dob = req.body.dob;

  pool.query(
    sql_query.query.register_user,
    [username, name, email, password, gender, address, dob],
    (err, data) => {
      /* if (err) {
        console.error("Error in adding user", err);
        res.redirect("/signup?reg=fail");
      } else {
        req.login(
          {
            username: username,
            password: password
          },
          function (err) {
            if (err) {
              return res.redirect("/signup?reg=fail");
            } else {
              return res.redirect("/users");
            }
          }
        );
      } */
      res.redirect("/users");
    }
  );
}

function registerAdmin(req, res, next) {
  const username = req.body.username;
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  pool.query(
    sql_query.query.register_admin,
    [username, name, email, password],
    (err, data) => {
      /* if (err) {
        console.error("Error in adding user", err);
        res.redirect("/signup?reg=fail");
      } else {
        req.login(
          {
            username: username,
            password: password
          },
          function (err) {
            if (err) {
              return res.redirect("/signup?reg=fail");
            } else {
              return res.redirect("/users");
            }
          }
        );
      } */
      res.redirect("/admin-dashboard");
    }
  );
}


function registerCreditCard(req, res, next) {
  console.log("hello");
  const username = req.user.username;
  const cardnumber = req.body.cardnumber;
  const nameoncard = req.body.nameoncard;
  const cvv = req.body.cvv;
  const expirydate = req.body.expirydate;

  pool.query(
    sql_query.query.register_credit_card,
    [username, cardnumber, nameoncard, cvv, expirydate],
    (err, data) => {
      res.redirect("/petOwner-profile");
    }
  );
}

function editAdmin(req, res, next) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const action = req.body.action;
  if (action == "Edit") {
    pool.query(
      sql_query.query.edit_admin,
      [name, email, password, username],
      (err, data) => {
        if (err) {
          console.error(err);
        }
        res.redirect("/admin-profiles");
      }
    );
  } else if (action == "Delete") {
    pool.query(sql_query.query.delete_admin, ["f", username], (err, data) => {
      if (err) {
        console.error(err);
      }
      res.redirect("/admin-profiles");
    });
  } else {
    res.redirect("/admin-profiles");
  }
}

function search(req, res, next) {
  pool.query(sql_query.query.all_users, (err, data) => {
    res.render("search", {
      title: "Data",
      data: data.rows,
      isSignedIn: req.isAuthenticated(),
    });
  });
}

function searchCaretaker(req, res, next) {
  const start = req.body.start;
  const end = req.body.end;
  pool.query(sql_query.query.search_caretaker, [start, end], (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    res.render("search", {
      title: "Data",
      data: data.rows,
      isSignedIn: req.isAuthenticated(),
    });
  });
}

// Render Function
function basic(req, res, page, other) {
  const info = {
    page: page,
    user: req.user.username,
    firstname: req.user.firstname,
    lastname: req.user.lastname,
    status: req.user.status,
  };
  if (other) {
    for (let field in other) {
      info[field] = other[field];
    }
  }
  res.render(page, info);
}

function msg(req, field, pass, fail) {
  // get query[field]
  // eg. query: /signup?reg=pass
  // - field = reg
  // - query[field] = pass
  const info = req.query[field] ? req.query[field] : ""; // if there is query[field], return query[field], else ""

  // if query[field] is pass, return pass
  return info ? (info == "pass" ? pass : fail) : "";
}

module.exports = initRouter;
