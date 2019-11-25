var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo');

var indexRouter = require('./routes/index');
var articlesRouter = require('./routes/articles');
var usersRouter = require('./routes/users');
var tagsRouter = require('./routes/tags');
var userRouter = require('./routes/user');
var profilesRouter = require('./routes/profiles');


var app = express();


// connect mongo
mongoose.connect("mongodb://localhost/conduit-api",
  {
     useNewUrlParser: true,
     useUnifiedTopology: true,

  },(err)=>{
     err ? console.log(err) : console.log("Connected to DB")
  })
  mongoose.set('useCreateIndex', true);


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/profiles', profilesRouter);


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


