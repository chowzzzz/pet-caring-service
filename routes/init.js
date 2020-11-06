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
		res.render("index", {
			title: "Express",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.get("/about", (req, res, next) => {
		res.render("about", {
			title: "About",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.get("/search", search);

	/* AUTHENTICATED GET */
	app.get("/petOwner-profile", passport.authMiddleware(), passport.verifyNotAdmin(), petOwnerProfile);

	app.get("/ct-home", passport.authMiddleware(), passport.verifyCaretaker(), caretakerHome);

	app.get("/admin-profile", passport.authMiddleware(), passport.verifyAdmin(), adminProfile);
	app.get("/admin-dashboard", passport.authMiddleware(), passport.verifyAdmin(), adminDashboard);

	app.get("/admin-profiles", passport.authMiddleware(), passport.verifyAdmin(), adminProfiles);
	app.get("/admin-user-profiles", passport.authMiddleware(), passport.verifyAdmin(), adminUserProfiles);
	app.get("/admin-user-profile", passport.authMiddleware(), passport.verifyAdmin(), adminUserProfile);
	app.get("/admin-caretaker-reviews", passport.authMiddleware(), passport.verifyAdmin(), adminCaretakerReviews);
	app.get("/admin-caretaker-salary", passport.authMiddleware(), passport.verifyAdmin(), adminCaretakerSalary);
	app.get("/admin-caretaker-salaries", passport.authMiddleware(), passport.verifyAdmin(), adminCaretakerSalaries);
	app.get("/admin-jobs", passport.authMiddleware(), passport.verifyAdmin(), adminJobs);
	app.get("/admin-job", passport.authMiddleware(), passport.verifyAdmin(), adminJob);

	app.get("/petOwner-addCreditCard", passport.authMiddleware(), passport.verifyNotAdmin(), function (req, res, next) {
		res.render("petOwner-addCreditCard", {
			title: "Register Credit Card",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.get("/petOwner-addPet", passport.authMiddleware(), passport.verifyNotAdmin(), function (req, res, next) {
		pool.query(sql_query.query.all_pet_categories, (err, petcategories) => {
			if (err) {
				console.error(err);
			}
			res.render("petOwner-addPet", {
				title: "Register Pet",
				petcategories: petcategories.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	});


	app.get("/caretaker-profile", passport.authMiddleware(), caretakerProfile);
	app.get("/caretaker-Jobs", passport.authMiddleware(), caretakerJobs);
	app.get("/caretaker-PetCategory", passport.authMiddleware(), caretakerPetCategory);
	app.get("/caretaker-ft-leaves", passport.authMiddleware(), caretakerFTLeaves);
	app.get("/caretaker-pt-availability", passport.authMiddleware(), caretakerPTAvailable);

	app.get("/petOwner-deletePet", passport.authMiddleware(), passport.verifyNotAdmin(), function (req, res, next) {
		res.render("petOwner-deletePet", {
			title: "Delete Pet",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.get("/petOwner-editProfile", passport.authMiddleware(), passport.verifyNotAdmin(), function (req, res, next) {
		const username = req.user.username;
		pool.query(sql_query.query.get_user, [username], (err, details) => {
			if (err) {
				console.error(err);
				return;
			}
			res.render("petOwner-editProfile", {
				title: "Edit Profile",
				details: details.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	});

	/* POST */
	app.post("/search", searchCaretaker);
	app.post("/caretaker-details", caretakerDetails);
	app.post("/register-job", registerJob);

	/* AUTHENTICATED POST */
	app.post("/petOwner-addCreditCard", passport.authMiddleware(), passport.verifyNotAdmin(), registerCreditCard); // REGISTER CREDIT CARD
	app.post("/petOwner-addPet", passport.authMiddleware(), passport.verifyNotAdmin(), registerPet); // REGISTER PET
	app.post("/petOwner-deletePet", passport.authMiddleware(), passport.verifyNotAdmin(), removePet); // REMOVE PET
	app.post("/petOwner-editProfile", passport.authMiddleware(), passport.verifyNotAdmin(), editProfile); // EDIT PET OWNER PROFILE
	app.post("/petOwner-review", passport.authMiddleware(), passport.verifyNotAdmin(), review);
	app.post("/petOwner-submitReview", passport.authMiddleware(), passport.verifyNotAdmin(), submitReview);

	app.post("/editAdmin", passport.authMiddleware(), passport.verifyAdmin(), editAdmin);
	app.post("/admin-jobs", passport.authMiddleware(), passport.verifyAdmin(), filterJobs);

	app.post("/caretaker-bidding", passport.authMiddleware(), passport.verifyNotAdmin(), caretakerBidding);

	/* SIGNUP */
	app.get("/signup", passport.antiMiddleware(), function (req, res, next) {
		res.render("signup", {
			title: "Sign Up",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.post("/signup", passport.antiMiddleware(), registerUser);

	/* SIGNIN */
	app.get("/signin", passport.antiMiddleware(), (req, res, next) => {
		res.render("signin", {
			title: "Sign In",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.post(
		"/signin",
		passport.authenticate("user-local", {
			successRedirect: "/",
			failureRedirect: "/signin"
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
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.post(
		"/admin-signin",
		passport.authenticate("admin-local", {
			successRedirect: "/admin-dashboard",
			failureRedirect: "/admin-signin"
		})
	);

	/* ADMINISTRATOR CREATE NEW */
	app.get("/admin-createnew", passport.authMiddleware(), passport.verifyAdmin(), function (req, res, next) {
		res.render("adminCreateNew", {
			title: "Create New Administrator",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});

	app.post("/admin-createnew", passport.authMiddleware(), passport.verifyAdmin(), registerAdmin);
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
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function petOwnerProfile(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
			return;
		}
		pool.query(sql_query.query.all_pets, [username], (err, pets) => {
			if (err) {
				console.error(err);
				return;
			}
			pool.query(sql_query.query.petowner_job, [username], (err, reservations) => {
				if (err) {
					console.error(err);
					return;
				}
				pool.query(sql_query.query.petowner_creditCard, [username], (err, creditcard) => {
					if (err) {
						console.error(err);
						return;
					}
					res.render("petOwner-profile", {
						title: "Pet Owner",
						details: details.rows,
						pets: pets.rows,
						reservations: reservations.rows,
						creditcard: creditcard.rows,
						isSignedIn: req.isAuthenticated(),
						isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
						isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
					});
				});
			});
		});
	});
}

function caretakerHome(req, res, next) {
	res.render("caretakerHome", {
		title: "Caretaker Home",
		isSignedIn: req.isAuthenticated(),
		isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
		isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
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
				pool.query(sql_query.query.underperforming_ct, (err, underperformingCt) => {
					if (err) {
						console.error(err);
					}
					pool.query(sql_query.query.monthly_salary, (err, monthly_salary) => {
						if (err) {
							console.error(err);
						}
						let username = topCaretakers.rows.map((a) => a.username);
						let totalAmount = topCaretakers.rows.map((a) => a.totalamount);

						let month = jobPerformance.rows.map((a) => a.month);
						let amountpaid = jobPerformance.rows.map((a) => a.amountpaid);
						res.render("adminDashboard", {
							title: "Admin Dashboard",
							monthly_job: monthlyJob.rows,
							monthly_salary: monthly_salary.rows,
							username: username,
							totalAmount: totalAmount,
							month: month,
							amountpaid: amountpaid,
							underperformingCt: underperformingCt.rows,
							isSignedIn: req.isAuthenticated(),
							isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
							isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
						});
					});
				});
			});
		});
	});
}

function adminUserProfiles(req, res, next) {
	pool.query(sql_query.query.all_users, (err, data) => {
		res.render("adminUserProfiles", {
			title: "User Profiles",
			data: data.rows,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function adminUserProfile(req, res, next) {
	const username = req.query.username ? req.query.username : req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, user) => {
		pool.query(sql_query.query.get_caretaker, [username], (err, caretaker) => {
			pool.query(sql_query.query.all_pets, [username], (err, pets) => {
				pool.query(sql_query.query.get_fulltime, [username], (err, fulltime) => {
					pool.query(sql_query.query.get_parttime, [username], (err, parttime) => {
						pool.query(sql_query.query.caretaker_category, [username], (err, caretaker_category) => {
							pool.query(sql_query.query.fulltime_leaves, [username], (err, caretaker_leaves) => {
								pool.query(sql_query.query.yearly_petdays, [username], (err, yearly_petdays) => {
									pool.query(sql_query.query.monthly_petdays, [username], (err, monthly_stats) => {
										pool.query(sql_query.query.caretaker_salary, [username], (err, caretaker_salary) => {
											user = user ? user.rows : null;
											pets = pets ? pets.rows : null;
											caretaker_category = caretaker_category ? caretaker_category.rows : null;
											caretaker_leaves =
												caretaker_leaves.rows[0] && !caretaker_leaves.rows.length == 0 && caretaker_leaves.rows[0].leaves
													? caretaker_leaves.rows[0].leaves
													: 0;
											yearly_petdays =
												yearly_petdays.rows[0] && !yearly_petdays.rows.length == 0 && yearly_petdays.rows[0].petdays ? yearly_petdays.rows[0].petdays : 0;
											let monthly_petdays =
												monthly_stats.rows[0] && !monthly_stats.rows.length == 0 && monthly_stats.rows[0].petdays ? monthly_stats.rows[0].petdays : 0;
											let monthly_amount =
												monthly_stats.rows[0] && !monthly_stats.rows.length == 0 && monthly_stats.rows[0].amountearned
													? monthly_stats.rows[0].amountearned
													: 0;
											caretaker_salary = caretaker_salary.rows[0] && !caretaker_salary.rows.length == 0 ? caretaker_salary.rows[0].totalamount : 0;
											let iscaretaker = caretaker && caretaker.rows.length > 0 ? true : false;
											let isPetowner = pets && pets !== undefined && pets.length > 0 ? true : false;
											let isFulltime = fulltime && fulltime.rows.length > 0 ? true : false;
											let isParttime = parttime && parttime.rows.length > 0 ? true : false;
											res.render("adminUserProfile", {
												title: "User Profile",
												data: user,
												pets: pets,
												caretaker_category: caretaker_category,
												caretaker_leaves: caretaker_leaves,
												yearly_petdays: yearly_petdays,
												monthly_petdays: monthly_petdays,
												monthly_amount: monthly_amount,
												caretaker_salary: caretaker_salary,
												iscaretaker: iscaretaker,
												isPetowner: isPetowner,
												isFulltime: isFulltime,
												isParttime: isParttime,
												isSignedIn: req.isAuthenticated(),
												isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
												isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}

function adminCaretakerReviews(req, res, next) {
	const username = req.query.username ? req.query.username : req.user.username;
	pool.query(sql_query.query.get_reviews, [username], (err, data) => {
		pool.query(sql_query.query.get_caretaker, [username], (err, caretaker) => {
			data = data && data.rows.length > 0 ? data.rows : null;
			caretaker = caretaker && caretaker.rows.length > 0 ? caretaker.rows : null;
			res.render("adminCaretakerReviews", {
				title: "Caretaker Reviews",
				data: data,
				caretaker: caretaker,
				username: username,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	});
}

function adminCaretakerSalary(req, res, next) {
	const username = req.query.username ? req.query.username : req.user.username;
	pool.query(sql_query.query.get_salary, [username], (err, data) => {
		data = data && data.rows.length > 0 ? data.rows : null;
		res.render("adminCaretakerSalary", {
			title: "Caretaker Salary Details",
			data: data,
			username: username,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function adminCaretakerSalaries(req, res, next) {
	pool.query(sql_query.query.get_salaries, (err, data) => {
		data = data && data.rows.length > 0 ? data.rows : null;
		res.render("adminCaretakerSalaries", {
			title: "All Caretaker Salary",
			data: data,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function adminJobs(req, res, next) {
	pool.query(sql_query.query.get_jobs, (err, data) => {
		data = data && data.rows.length > 0 ? data.rows : null;
		res.render("adminJobs", {
			title: "Jobs",
			data: data,
			selectedValue: "ALL",
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function filterJobs(req, res, next) {
	const filter = req.body.filter.toUpperCase();
	console.log(filter);
	if (filter == "ALL") {
		pool.query(sql_query.query.get_jobs, (err, data) => {
			data = data && data.rows.length > 0 ? data.rows : null;
			res.render("adminJobs", {
				title: "Jobs",
				data: data,
				selectedValue: "ALL",
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	} else {
		pool.query(sql_query.query.get_filtered_jobs, [filter], (err, data) => {
			data = data && data.rows.length > 0 ? data.rows : null;
			res.render("adminJobs", {
				title: "Jobs",
				data: data,
				selectedValue: filter,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	}
}

function adminJob(req, res, next) {
	const ctusername = req.query.ctusername;
	const pousername = req.query.pousername;
	const petname = req.query.petname;

	let startdate = new Date(req.query.startdate);
	const offset = startdate.getTimezoneOffset();
	startdate = new Date(startdate.getTime() - offset * 60 * 1000);
	startdate = startdate.toISOString().split("T")[0];
	pool.query(sql_query.query.get_job, [ctusername, pousername, petname, startdate], (err, data) => {
		if (err) {
			console.error(err);
		}
		data = data && data.rows.length > 0 ? data.rows : null;
		res.render("adminJob", {
			title: "Jobs",
			data: data,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function adminProfiles(req, res, next) {
	pool.query(sql_query.query.get_admins, (err, data) => {
		res.render("adminProfiles", {
			title: "Admin Profiles",
			data: data.rows,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function adminProfile(req, res, next) {
	const username = req.query.username ? req.query.username : req.user.username;
	pool.query(sql_query.query.get_admin, [username], (err, data) => {
		if (err) {
			console.error(err);
		}
		res.render("adminProfile", {
			title: "Admin Profile",
			data: data.rows,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
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

	pool.query(sql_query.query.register_user, [username, name, email, password, gender, address, dob], (err, data) => {
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
		res.redirect("/petOwner-profile");
	});
}

function registerAdmin(req, res, next) {
	const username = req.body.username;
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	pool.query(sql_query.query.register_admin, [username, name, email, password], (err, data) => {
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
	});
}

function registerCreditCard(req, res, next) {
	const username = req.user.username;
	const cardnumber = req.body.cardnumber.replace(/\s/g, "");
	const nameoncard = req.body.nameoncard;
	const cvv = req.body.cvv;
	const expirydate = req.body.expirydate;

	pool.query(sql_query.query.register_credit_card, [username, cardnumber, nameoncard, cvv, expirydate], (err, data) => {
		res.redirect("/petOwner-profile");
	});
}

function registerPet(req, res, next) {
	const username = req.user.username;
	const petname = req.body.petname;
	const dateofbirth = req.body.dateofbirth;
	const gender = req.body.gender;
	const description = req.body.description;
	const specialreqs = req.body.specialreqs;
	const personality = req.body.personality;
	const category = req.body.category;

	pool.query(sql_query.query.register_pet, [username, petname, dateofbirth, gender, description, specialreqs, personality, category], (err, data) => {
		res.redirect("/petOwner-profile");
	});
}

function removePet(req, res, next) {
	const username = req.user.username;
	const petname = req.body.petname;

	pool.query(sql_query.query.remove_pet, [username, petname], (err, data) => {
		res.redirect("/petOwner-profile");
	});
}

function editAdmin(req, res, next) {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const username = req.body.username;
	const action = req.body.action;
	if (action == "Edit") {
		pool.query(sql_query.query.edit_admin, [name, email, password, username], (err, data) => {
			if (err) {
				console.error(err);
			}
			res.redirect("/admin-profiles");
		});
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

function editProfile(req, res, next) {
	const username = req.body.username;
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const address = req.body.address;
	const action = req.body.action;

	if (action == "Edit") {
		pool.query(sql_query.query.edit_profile, [name, email, password, address, username], (err, data) => {
			if (err) {
				console.error(err);
			}
			res.redirect("/petOwner-profile");
		});
	} else if (action == "Delete") {
		pool.query(sql_query.query.delete_profile, ["f", username], (err, data) => {
			if (err) {
				console.error(err);
			}
			res.redirect("/signin");
		});
	} else {
		res.redirect("/petOwner-profile");
	}
}

function review(req, res, next) {
	const pousername = req.user.username;
	const ctusername = req.body.ctusername;
	const petname = req.body.petname;
	const startdate = req.body.startdate;

	res.render("petOwner-review", {
		title: "Review",
		pousername: pousername,
		ctusername: ctusername,
		petname: petname,
		startdate: startdate,
		isSignedIn: req.isAuthenticated(),
		isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
		isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
	});
	res.redirect("/petOwner-review");
};

function submitReview(req, res, next) {
	const pousername = req.user.username;
	const ctusername = req.body.ctusername;
	const petname = req.body.petname;
	var date = new Date(req.body.startdate);
	const startdate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
	const rating = req.body.rating;
	const review = req.body.review;

	pool.query(sql_query.query.update_review, [rating, review, pousername, ctusername, petname, startdate], (err, data) => {
		if (err) {
			console.error(err);
		}
		res.redirect("/petOwner-profile");
	});
}

function search(req, res, next) {
	pool.query(sql_query.query.all_pet_categories, (err, petcategories) => {
		if (err) {
			console.error(err);
		}
		res.render("search", {
			title: "Data",
			start: "...",
			end: "...",
			category: "...",
			data: {},
			numresults: 0,
			petcategories: petcategories.rows,
			isSignedIn: req.isAuthenticated(),
			isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
			isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
		});
	});
}

function searchCaretaker(req, res, next) {
	const username = req.isAuthenticated() ? req.user.username : "";
	const start = req.body.start;
	const end = req.body.end;
	const category = req.body.category;
	pool.query(sql_query.query.search_caretaker, [start, end, username, category], (err, data) => {
		if (err) {
			console.log(err);
			return;
		}
		pool.query(sql_query.query.all_pet_categories, (err, petcategories) => {
			if (err) {
				console.error(err);
			}
			res.render("search", {
				title: "Data",
				start,
				end,
				category,
				data: data.rows,
				numresults: data.rows.length,
				petcategories: petcategories.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
				isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
			});
		});
	});
}

function caretakerDetails(req, res, next) {
	const username = req.query.username;
	pool.query(sql_query.query.caretaker_asAppUser, [username], (err, details) => {
		if (err) {
			console.log(err);
			return;
		}
		pool.query(sql_query.query.caretaker_category, [username], (err, petCategories) => {
			if (err) {
				console.error(err);
				return;
			}
			pool.query(sql_query.query.caretaker_jobview, [username], (err, reservations) => {
				if (err) {
					console.error(err);
					return;
				}
				res.render("caretaker-details", {
					title: "Data",
					username,
					start: req.query.start,
					end: req.query.end,
					category: req.query.category,
					details: details.rows,
					petCategories: petCategories.rows,
					reservations: reservations.rows,
					isSignedIn: req.isAuthenticated(),
					isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
					isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
				});
			});
		});
	});
}

function caretakerBidding(req, res, next) {
	const username = req.user.username;
	const category = req.query.category;
	console.log(category);
	pool.query(sql_query.query.caretaker_asAppUser, [username], (err, details) => {
		if (err) {
			console.log(err);
			return;
		}
		pool.query(sql_query.query.petowner_creditCard, [username], (err, cards) => {
			if (err) {
				console.error(err);
				return;
			}
			pool.query(sql_query.query.caretaker_jobview, [username], (err, reservations) => {
				if (err) {
					console.error(err);
					return;
				}
				pool.query(sql_query.query.all_petsInCategory, [username, category], (err, pets) => {
					if (err) {
						console.error(err);
						return;
					}
					res.render("caretaker-bidding", {
						title: "Data",
						username,
						start: req.query.start,
						end: req.query.end,
						category,
						details: details.rows,
						cards: cards.rows,
						reservations: reservations.rows,
						pets: pets.rows,
						isSignedIn: req.isAuthenticated(),
						isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false,
						isCaretaker: req.isAuthenticated() ? req.user.isCaretaker : false
					});
				});
			});
		});
	});
}

function registerJob(req, res, next) {
	const ctusername = req.query.username;
	const pousername = req.user.username;
	const petname = req.body.petname;
	const startdate = req.query.start;
	const enddate = req.query.end;
	const paymenttype = req.body.payment;
	const deliverytype = req.body.delivery;
	const amountpaid = req.body.amountpaid;

	pool.query(sql_query.query.register_job, [ctusername, pousername, petname, startdate, enddate, paymenttype, deliverytype, amountpaid], (err, data) => {
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
		res.redirect("/petOwner-profile");
	});
}

function caretakerProfile(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.caretaker_petType, [username], (err, pets) => {
			if (err) {
				console.error(err);
			}
			pool.query(sql_query.query.caretaker_review, [username], (err, review) => {
				if (err) {
					console.error(err);
				}
				pool.query(sql_query.query.caretaker_rating, [username], (err, rating) => {
					if (err) {
						console.error(err);
					}
					res.render("caretaker-profile", {
						title: "Care Taker Profile",
						details: details.rows,
						pets: pets.rows,
						review: review.rows,
						rating: rating.rows,
						isSignedIn: req.isAuthenticated(),
						isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false
					});
				});
			});
		});
	});
}

function caretakerJobs(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.caretaker_jobview, [username], (err, job) => {
			if (err) {
				console.error(err);
			}
			res.render("caretaker-Jobs", {
				title: "Care Taker Jobs",
				details: details.rows,
				job: job.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false
			});
		});
	});
}

function caretakerPetCategory(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.caretaker_category, [username], (err, category) => {
			if (err) {
				console.error(err);
			}
			res.render("caretaker-PetCategory", {
				title: "Care Taker Category",
				details: details.rows,
				category: category.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false
			});
		});
	});
}

function caretakerFTLeaves(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.fulltime_leavedays, [username], (err, leaves) => {
			if (err) {
				console.error(err);
			}
			res.render("caretaker-leaves", {
				title: "FT Care Taker leaves",
				details: details.rows,
				leaves: leaves.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false
			});
		});
	});
}

function caretakerPTAvailable(req, res, next) {
	const username = req.user.username;
	pool.query(sql_query.query.get_user, [username], (err, details) => {
		if (err) {
			console.error(err);
		}
		pool.query(sql_query.query.parttime_availdays, [username], (err, available) => {
			if (err) {
				console.error(err);
			}
			res.render("caretaker-leaves", {
				title: "FT Care Taker leaves",
				details: details.rows,
				available: available.rows,
				isSignedIn: req.isAuthenticated(),
				isAdmin: req.isAuthenticated() ? req.user.userType == "Admin" : false
			});
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

