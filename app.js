var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');
const multer = require('multer')
const twilio = require('twilio');

var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var searchRouter = require('./routes/search');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// session middlewear
app.use(session({
  secret: 'mySecret',
  resave: false,
  saveUninitialized: false
}));


app.use((req, res, next) => {
  res.set("Cache-control", "no-store,no-cashe");
   next();
  });



app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/admin', adminRouter);
app.use('/', usersRouter);
app.use('/search', searchRouter);


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



// Connecting to mongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB new');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});


module.exports = app;
