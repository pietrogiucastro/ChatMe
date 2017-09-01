var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

var Config = require('../environment'),
conf = new Config();

var db = require('../db/mongoose.js');


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

router.get('/', function(req, res, next) {
  res.render('index', {title: 'chat.me'});
});

router.get('/client/:version', function(req, res, next) {
	var version = req.params.version;
	res.render('clients/'+version);
});

router.post('/login', function(req, res, next) {
	var username = req.params.user;
	var password = req.params.pass;

	db.findUserByCredentials(username, password, function(err, user) {
		if(err) {
			res.json({result: 'error', error: 'Internal error. Try again later.'});
			return;
		}
		if (!user) {
			res.json({result: 'error', error: 'Wrong username or password'});
			return;
		}
		//send json with user and token
			res.json({result: 'success', user: user.name, token: user.token});
	});
});

router.post('/signup', function(req, res, next) {
	var username = req.params.user;
	var password = req.params.pass;
	var email = req.params.email;
	if (typeof username != 'string' || typeof password != 'string') {
		res.json({result: 'error', error: 'Internal error. Try again later.'});
	} 

	db.createUser(usermame, password, email, function(err, user) {
		if (err) {
			if (err.type == "cm-error") {
				res.json(err);
			} else {
				res.json({result: 'error', error: 'Internal error. Try again later.'});
			}
			return;
		}
		res.json({result: 'success', message: 'Account created! Login with your credentials'});
	});
});

module.exports = router;
