var express = require('express');
var router = express.Router();

/* SQL Query */
var sql_query = 'SELECT * FROM appuser';

// GET
router.get('/', function(req, res, next) {
  res.render('petownersummary', { title: 'Pet Owner Summary' });
});


module.exports = router;
