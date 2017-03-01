'use strict'

var http = require('http');
var url = require('url');
var controller = require('./controller/controller.js');
const expressSession = require('express-session')
var fs = require('fs');
var express = require('express');
var favicon = require('serve-favicon');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport')
var passportStrategy = require('passport-local').Strategy

const dbutils = require('./controller/model/DButils.js')

var exportsHandler={};

var search = require('./routes/search');
var artists = require('./routes/artists');
var homeNoLogin = require('./routes/homeNoLogin');
var login = require('./routes/login')(passport);
var signup = require('./routes/signup')(passport);
var logout = require('./routes/logout');
var albums = require('./routes/albums');
var users = require('./routes/users');
var profiles = require('./routes/profiles');

var port = 3000;

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/controller/view'));
app.set('view engine', 'hbs');

/**
 * Passport setup
 */
passport.use(new passportStrategy((username, password, cb) => {
        dbutils.authenticate(
            username, 
            password,
            cb
        )
}))

passport.use('local-signup',new passportStrategy({usernameField: 'username', passwordField: 'password', passReqToCallback: true},
       function(req,username,password, cb){
       dbutils.createUser(
            username, req.body.nome, req.body.email, password, cb
        )
}))

passport.deserializeUser((userId, cb) => {
    dbutils.find(userId, cb)
})
passport.serializeUser((user, cb) => {
    cb(null, user.username)
})


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({ 
    secret: 'space odity' ,
    resave:true,
    saveUninitialized:true}));
app.use(passport.initialize())
app.use(passport.session());


app.use('/search', search);
app.use('/artists', artists);
app.use('/',homeNoLogin);
app.use('/login',login);
app.use('/logout',logout);
app.use('/signup',signup);
app.use('/albums', albums);
app.use('/users',users);
app.use('/profile',profiles);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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






exportsHandler.appHandler = app;
exportsHandler.passportStrategyHandler = passportStrategy;

controller.init();

console.log("http local server connected on port " + port);

module.exports = exportsHandler;