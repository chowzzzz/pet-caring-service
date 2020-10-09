const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const cors = require("cors");

const PORT = 5000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.post("/", function(req, res) {
    res.send(req.body);
});

require("./routes/petowner")(app);
require("./routes/caretaker")(app);
require("./routes/admin")(app);
require("./routes/pet")(app);
require("./routes/creditcard")(app);
require("./routes/jobs")(app);

app.listen(PORT, () => {
    console.log(`Server has started on port ${PORT}`);
});
