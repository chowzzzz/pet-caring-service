const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    password: "Pass12345",
    host: "localhost",
    port: 5432,
    database: "PetCaringService"
});

module.exports = pool;
