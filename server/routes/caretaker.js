const pool = require("../db/db");

// username, pwd, name, email, joindate, isactive, gender, dob, address, userrole? (parttime/fulltime)

module.exports = (app) => {
    // create caretaker- register
    app.post("/caretaker", async (req, res) => {
        try {
            const { username, password, name, email, joindate, isactive, gender, dateofbirth, address, userrole } = req.body;
            const newCaretaker = await pool.query("INSERT INTO Caretaker (username, password, name, email, joindate, isactive, gender, dateofbirth, address, userrole) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *", 
                [username, password, name, email, Date.now(), true, gender, dateofbirth, address, userrole]);

            res.json(newCaretaker);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all CareTakers
    app.get("/caretaker", async (res, req) => {
        try {
            const allCareTaker = await pool.query("SELECT * FROM Caretaker");
            res.json(allCareTaker);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get Caretaker by username
    app.get("/caretaker/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const caretaker = await pool.query("SELECT * FROM Caretaker WHERE username = $1", [username]);

            res.json(caretaker.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // update Caretaker
    app.put("caretaker/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const { username, password, name, email, joindate, isactive, gender, dateofbirth, address, userrole } = req.body;

            const updateCareTaker = await pool.query("UPDATE Caretaker SET username = $1, password = $2, name = $3, email = $4, joindate = $5, isactive = $6, gender = $7, dateofbirth =$8, address =$9, userrole =$10 WHERE username = $11", 
                [newUsername, password, name, email, joindate, isactive, gender, dateofbirth, address, userrole, username]);

            res.json("caretaker was updated!");
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Caretaker (set isActive to false)
    app.put("caretaker/:username", async (res, req) => {
        try {
            const { username } = req.params;

            await pool.query("UPDATE Caretaker SET isactive = $1 WHERE username = $2", 
                [false, username]);

            res.json("Caretaker was deleted!");
        } catch (err) {
            console.error(err.message);
        }
    })
};