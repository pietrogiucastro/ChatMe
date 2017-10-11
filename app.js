var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var index = require(path.join(__dirname, 'routes/index'));

var Config = require('./environment'),
conf = new Config();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
//app.use(require('helmet')());

//app.use('/', routes);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 // var err = new Error("404 error! " + req.url + ' Not Found');
 var err = "404 error! " + req.url + ' Not Found';
 console.log(err);
 res.sendStatus(404);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if (err) console.log(err);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  if (err) console.log(err);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
