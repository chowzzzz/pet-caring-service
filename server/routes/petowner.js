const pool = require("../db/db");

// username, pwd, name, email, joindate, isactive, gender, dob, address

module.exports = (app) => {
    // create petowner - register
    app.post("/petowner", async (req, res) => {
        try {
            const { username, password, name, email, gender, dateofbirth } = req.body;
            const newPetowner = await pool.query("INSERT INTO PetOwner (username, password, name, email, gender, dateofbirth, address, joindate, isactive) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", 
                [username, password, name, email, gender, dateofbirth, Date.now(), true]);

            res.json(newPetowner);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all petowners
    app.get("/petowner", async (res, req) => {
        try {
            const allPetowners = await pool.query("SELECT * FROM PetOwner");
            res.json(allPetowners);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get petowner by username
    app.get("/petowner/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const petowner = await pool.query("SELECT * FROM PetOwner WHERE username = $1", [username]);

            res.json(petowner.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // update petowner
    app.put("petowner/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const { newUsername, password, name, email, gender, dateofbirth } = req.body;

            const updatePetowner = await pool.query("UPDATE PetOwner SET username = $1, password = $2, name = $3, email = $4, gender = $5, dateofbirth = $6 WHERE username = $7", 
                [newUsername, password, name, email, gender, dateofbirth, username]);

            res.json("Petowner was updated!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete petowner (set isActive to false)
    app.put("petowner/:username", async (res, req) => {
        try {
            const { username } = req.params;

            await pool.query("UPDATE PetOwner SET isactive = $1 WHERE username = $2", 
                [false, username]);

            res.json("Petowner was deleted!");
        } catch (err) {
            console.error(err.message);
        }
    })
};
