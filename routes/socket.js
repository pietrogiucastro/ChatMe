var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var fs = require('fs');
var ioserver = require('http').createServer(app);


var Config = require('../environment'),
conf = new Config();

router.get('/', function(req, res, next) {
  res.render('socket', {title: 'chat.me'});
});

module.exports = router;
