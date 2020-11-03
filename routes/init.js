const sql_query = require("../sql");
const passport = require("passport");
// const bcrypt = require("bcrypt");

// PostgreSQL Connection
const { Pool } = require("pg");
const sql = require("../sql");
const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// Define routes here
function initRouter(app) {
	/* GET */
	app.get("/", (req, res, next) => {
		res.render("index", { title: "Express", isSignedIn: req.isAuthenticated() });
	});

	app.get("/about", (req, res, next) => {
		res.render("about", { title: "About", isSignedIn: req.isAuthenticated() });
	});

	app.get("/search", search);

	/* AUTHENTICATED GET */
	app.get("/users", passport.authMiddleware(), users);
	app.get("/profile", passport.authMiddleware(), petOwnerProfile);

	app.get("/adminDashboard", passport.authMiddleware(), adminDashboard);
	app.get("/adminUser", passport.authMiddleware(), adminUser);
	app.get("/adminCaretaker", passport.authMiddleware(), adminCaretaker);
	app.get("/adminPetowner", passport.authMiddleware(), adminPetowner);
	app.get("/adminPet", passport.authMiddleware(), adminPet);
	app.get("/adminJob", passport.authMiddleware(), adminJob);
	app.get("/adminProfiles", passport.authMiddleware(), adminProfiles);
	app.get("/adminProfile", passport.authMiddleware(), adminProfile);

	/* AUTHENTICATED POST */

	/* SIGNUP */
	app.get("/signup", passport.antiMiddleware(), function (req, res, next) {
		res.render("signup", { title: "Sign Up", isSignedIn: req.isAuthenticated() });
	});
	app.post("/signup", passport.antiMiddleware(), registerUser);

	/* SIGNIN */
	app.get("/signin", passport.antiMiddleware(), (req, res, next) => {
		res.render("signin", { title: "Sign In", isSignedIn: req.isAuthenticated() });
	});
	app.post(
		"/signin",
		passport.authenticate("local", {
			successRedirect: "/users",
			failureRedirect: "/"
		})
	);

	/* SIGNOUT */

	app.get("/signout", passport.authMiddleware(), function (req, res, next) {
		req.session.destroy();
		req.logout();
		res.redirect("/");
	});
}

// Define functions to get your data + routes here if its too long in the initRouter() function
// GET
function users(req, res, next) {
	pool.query(sql_query.query.all_users, (err, data) => {
		res.render("users", { title: "Data", data: data.rows, isSignedIn: req.isAuthenticated() });
	});
}

function search(req, res, next) {
	pool.query(sql_query.query.all_users, (err, data) => {
		res.render("search", { title: "Data", data: data.rows, isSignedIn: req.isAuthenticated() });
	});
}

function petOwnerProfile(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.all_pets, [username], (err, pets) => {
			if (err) {
				console.error(err);
			}
			pool.query(sql_query.query.petowner_job, [username], (err, reservations) => {
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
					isSignedIn: req.isAuthenticated()
				});
			});
		});
	});
}

function adminUser(req, res, next) {
	res.render("adminUser", {
		title: "Users",
		isSignedIn: req.isAuthenticated()
	});
}

function adminCaretaker(req, res, next) {
	res.render("adminCaretaker", {
		title: "Caretakers",
		isSignedIn: req.isAuthenticated()
	});
}

function adminPetowner(req, res, next) {
	res.render("adminPetowner", {
		title: "Pet owners",
		isSignedIn: req.isAuthenticated()
	});
}

function adminPet(req, res, next) {
	res.render("adminPet", {
		title: "Pets",
		isSignedIn: req.isAuthenticated()
	});
}

function adminJob(req, res, next) {
	res.render("adminJob", {
		title: "Jobs",
		isSignedIn: req.isAuthenticated()
	});
}

function adminProfiles(req, res, next) {
	res.render("adminProfiles", {
		title: "Admin profiles",
		isSignedIn: req.isAuthenticated()
	});
}

function adminProfile(req, res, next) {
	res.render("adminProfile", {
		title: "Admin Profile",
		isSignedIn: req.isAuthenticated()
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

// Render Function
function basic(req, res, page, other) {
	const info = {
		page: page,
		user: req.user.username,
		firstname: req.user.firstname,
		lastname: req.user.lastname,
		status: req.user.status
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
