var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');
var passport = require('passport');

require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var aboutRouter = require('./routes/about');
var selectRouter = require('./routes/select');
var signupRouter = require('./routes/signup');
var signinRouter = require('./routes/signin');

var app = express();

// Authentication Setup
require('./auth').init(app);
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/about', aboutRouter);
app.use('/select', selectRouter);
app.use('/signup', signupRouter);
app.use('/signin', signinRouter);

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
