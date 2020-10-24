const pool = require("../db/db");

// usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, 
// amountpaid, review

module.exports = (app) => {
    // create jobs register
    app.post("/job", async (req, res) => {
        try {
            const { usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, amountpaid, review } = req.body;
            const newJob = await pool.query("INSERT INTO Admin (usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, amountpaid, review VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *", 
                [usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, amountpaid, review]);

            res.json(newJob);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all job
    app.get("/job", async (res, req) => {
        try {
            const allJobs = await pool.query("SELECT * FROM Job");
            res.json(allJobs);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get jobs by usernameCaretaker
    app.get("/job/:usernameCareTaker", async (res, req) => {
        try {
            const { usernameCareTaker } = req.params;
            const job = await pool.query("SELECT * FROM Job WHERE username = $1", [usernameCareTaker]);

            res.json(job.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // update job (From Petowner)
    app.put("job/:usernamePetOwner", async (res, req) => {
        try {
            const { usernamePetOwner } = req.params;
            const { usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, amountpaid, review } = req.body;

            const updateJob = await pool.query("UPDATE Job SET usernamePetOwner = $1, usernameCareTaker = $2, namePet = $3, startdate = $4, enddate =$5, timestamp = $6, rating = $7, paymenttype = $8, deliverytype = $9, amountpaid =$10, review = $11 WHERE usernamePetOwner = $12", 
                [usernamePetOwner, usernameCareTaker, namePet, startdate, enddate, timestamp, rating, paymenttype, deliverytype, amountpaid, review, usernamePetOwner]);

            res.json("Job was updated!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Job From caretaker
    app.put("job/:usernameCareTaker", async (res, req) => {
        try {
            const { usernameCareTaker } = req.params;

            await pool.query("DELETE j FROM Job WHERE usernameCareTaker = $1", [usernameCareTaker]);

            res.json("Job was removed!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Job From petownner
    app.put("job/:usernamePetOwner", async (res, req) => {
        try {
            const { usernamePetOwner } = req.params;

            await pool.query("DELETE j FROM Job WHERE usernamePetOwner = $1", [usernamePetOwner]);

            res.json("Job was removed!");
        } catch (err) {
            console.error(err.message);
        }
    })
};
