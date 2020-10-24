const pool = require("../db/db");

// username, number", cvv, fullname, expirydate
    
module.exports = (app) => {
    // create Admin- register
    app.post("/admin", async (req, res) => {
        try {
            const { username, password, name, email, joindate, isactive } = req.body;
            const newAdmin = await pool.query("INSERT INTO Admin (username, password, name, email, joindate, isactive) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", 
                [username, password, name, email, Date.now(), true]);

            res.json(newAdmin);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all Admins
    app.get("/admin", async (res, req) => {
        try {
            const allAdmins = await pool.query("SELECT * FROM Admin");
            res.json(allAdmins);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get Admin by username
    app.get("/admin/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const admin = await pool.query("SELECT * FROM Admin WHERE username = $1", [username]);

            res.json(admin.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // update Admin
    app.put("admin/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const { newUsername, password, name, email, joindate, isactive } = req.body;

            const updatePetowner = await pool.query("UPDATE PetOwner SET username = $1, password = $2, name = $3, email = $4, joindate = $5, isactive = $6 WHERE username = $7", 
                [newUsername, password, name, email, joindate, isactive, username]);

            res.json("Admin was updated!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Admin (set isActive to false)
    app.put("admin/:username", async (res, req) => {
        try {
            const { username } = req.params;

            await pool.query("UPDATE PetOwner SET isactive = $1 WHERE username = $2", 
                [false, username]);

            res.json("Admin was deleted!");
        } catch (err) {
            console.error(err.message);
        }
    })
};