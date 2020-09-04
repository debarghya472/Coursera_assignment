const express = require('express');
const http =require('http');
const passport =require('passport');
const authenticate=require('./authenticate');
const dishRouter =require('./routes/dishRouter');
const morgan =require('morgan');
const path =require('path');
var config =require('./config')
const cookieParser =require('cookie-parser');
const indexRouter =require('./routes/index')
const promoRouter =require('./routes/promotionRouter');
const leaderRouter =require('./routes/leaderRouter');
const userRouter =require('./routes/users');
const uploadRouter =require('./routes/uploadRouter');
const mongoose = require('mongoose');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');

const Dishes = require('./models/dishes');

var app = express();

// Secure traffic only
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

const url = config.mongoUrl;
const connect = mongoose.connect(url,{ useNewUrlParser: true,useUnifiedTopology: true ,'useCreateIndex':true});
connect.then((db) => {
    console.log("Connected correctly to mongodb server");
}, (err) => { console.log(err); });

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use(morgan('dev'));
app.use('/dishes', dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use('/imageUpload',uploadRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

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
