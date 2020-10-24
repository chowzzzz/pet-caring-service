const pool = require("../db/db");

// usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, 
// amountpaid, review

module.exports = (app) => {
	const Jobpost = require("../controllers/job.controller.js");

	var router = require("express").Router();
	
	// Retrieve all JobPost
	router.get("/", Job.findAll);

	// Retrieve a single Stdeunt with id
	router.get("/:id", Job.findOne);

	// Update a JobPost with id
	router.put("/:id", Job.update);

	// Delete a JobPost with id
	router.delete("/:id", Job.delete);

	// Create a new JobPost
	router.delete("/", Job.deleteAll);

	app.use("/api/jobs", router);
};
