const pool = require("../db/db");

// username, number", cvv, fullname, expirydate
    
module.exports = (app) => {
    // create creditcard register
    app.post("/creditcard", async (req, res) => {
        try {
            const { username, number, cvv, fullname, expirydate } = req.body;
            const newCreditcard = await pool.query("INSERT INTO Creditcard (username, number, cvv, fullname, expirydate) VALUES ($1, $2, $3, $4, $5) RETURNING *",     
                [username, number, cvv, fullname, expirydate]);

            res.json(newCreditcard);
        } catch (err) {
            console.error(err.message);
        }
    });

    // get all Creditcards
    app.get("/creditcard", async (res, req) => {
        try {
            const allCreditcards = await pool.query("SELECT * FROM Creditcard");
            res.json(allCreditcards);
        } catch (err) {
            console.error(err.message);
        }
    })

    // get Creditcard by username
    app.get("/credditcard/:username", async (res, req) => {
        try {
            const { username } = req.params;
            const creditcard = await pool.query("SELECT * FROM Creditcard WHERE username = $1", [username]);

            res.json(creditcard.rows[0]);
        } catch (err) {
            console.error(err.message);
        }
    })

    // delete Creditcard 
    app.put("creditcard/:username", async (res, req) => {
        try {
            const { username } = req.params;

            await pool.query("DELETE c FROM Creditcard WHERE username = $1", [username]);

            res.json("Card was removed!");
        } catch (err) {
            console.error(err.message);
        }
    })
};