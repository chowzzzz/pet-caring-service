const pool = require("../db/db");

//username, name, age (change to dob??), gender, description, specialreqs, personality 

module.exports = (app) => {
    // create Pet register
    app.post("/pet", async (req, res) => {
        try {
            const { username, name, dateofbirth, gender, description, specialreqs, personality } = req.body;
            const newPet = await pool.query("INSERT INTO Pet (username, name, dateofbirth, gender, description, specialreqs, personality) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", 
                [username, name, dateofbirth, gender, description,specialreqs, personality]);

            res.json(newPet);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all Pets
    app.get("/pet", async (res, req) => {
        try {
            const allPets = await pool.query("SELECT * FROM Pet");
            res.json(allPets);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get Pet by username
    app.get("/pet/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const pet = await pool.query("SELECT * FROM Pet WHERE username = $1", [username]);

            res.json(pet.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // update Pet
    app.put("pet/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const { username, name, dateofbirth, gender, description,specialreqs, personality } = req.body;

            const updatePet = await pool.query("UPDATE Pet SET username = $1, name = $2, name = $3, dateofbirth = $4, gender = $5, description = $6, specialreqs = $7, personality = $8 WHERE username = $9" 
                [username, name, dateofbirth, gender, description,specialreqs, personality, username]);

            res.json("Pet was updated!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Pet 
    app.put("pet/:username", async (res, req) => {
        try {
            const { username } = req.params;

            await pool.query("DELETE p FROM pet WHERE username = $1", [username]);

            res.json("Pet was removed!");
        } catch (err) {
            console.error(err.message);
        }
    })
};