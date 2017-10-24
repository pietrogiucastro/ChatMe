'use strict'

var moment = require('moment');
var events = require('events')
var eventEmitter = new events.EventEmitter();
var db = require('../db/mongoose.js');

var options = {
	muteThreshold: 5,
	muteSeconds : [
		30,
		60,
		250,
		600,
		1500,
		10000
	]
}
var connectedSockets, io;

exports.init = function(_connectedSockets, _io) {
	connectedSockets = _connectedSockets;
	io = _io;
}

exports.checkSpam = function(socket) {
	var userid = socket.user.id;

	if (socket.user.spam.muted) { //check if user can talk
		var canTalk = moment().diff(socket.user.spam.mutedTill) > 0;
		if (canTalk) setField(userid, {muted: false});
	}

}

exports.addSpam = function(socket) {
	var userid = socket.user.id, updatehash = {};

	if (socket.user.spam.muted) { //check if user can talk
		var canTalk = moment().diff(socket.user.spam.mutedTill) > 0;
		if (canTalk) setField(userid, {muted: false});

		return;
	}

	var lastInteraction = moment.duration(moment().diff(socket.user.spam.lastInteraction)).asSeconds();
	updatehash.lastInteraction = moment();

	if (lastInteraction < 2) updatehash.score = socket.user.spam.score+1; //spamming
	else { //good boy
		var newScore = Math.max(socket.user.spam.score - Math.round(lastInteraction), 0);
		updatehash.score = newScore;

	    if (socket.user.spam.muteLevel >= 0) { // 20 min of silence = lower Mute level
	    	var lastMute = moment.duration(moment().diff(socket.user.spam.lastMute)).asSeconds();
	    	if (lastMute >= 1200) {
		    	updatehash.lastMute = moment();
		    	updatehash.muteLevel = socket.user.spam.muteLevel-1;
	    	}
	    }
	}

	setField(userid, updatehash);

	if (socket.user.spam.score >= options.muteThreshold) { //muted!
		var mutehash = {};
		if (socket.user.spam.muteLevel < 5) mutehash.muteLevel = socket.user.spam.muteLevel+1;
		mutehash.score = 0;
		console.log(socket.user.spam.muteLevel);
		mutehash.mutedTill = moment().add(options.muteSeconds[socket.user.spam.muteLevel], 'seconds');
		mutehash.muted = true;
		mutehash.lastMute = moment();

		setField(userid, mutehash);

		eventEmitter.emit('muted', userid, mutehash.mutedTill.toDate());
	}

}

function setField(userid, hash) {
	connectedSockets[userid].forEach(function(socketid) {
		var socket = io.sockets.connected[socketid];
		Object.assign(socket.user.spam, hash);
	});

	var dbhash = {};
	for (var key in hash) {
		dbhash['spam.' + key] = hash[key];
	}

	db.updateUserData(userid, dbhash, function(err, result) {
		if (err) return console.log(err);
		if (!result || !result.nModified) console.log("ERROR! No user found with id " + userid);
	});
}

exports.event = eventEmitter;
exports.antiSpam = exports;