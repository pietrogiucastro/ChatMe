'use strict'

var moment = require('moment');
var events = require('events')
var eventEmitter = new events.EventEmitter();

var options = {
	muteThreshold: 6,
	muteSeconds : [
		30,
		60,
		250,
		600,
		1500,
		10000
	]
}
var connectedSockets;

exports.init = function(_connectedSockets) {
	connectedSockets = _connectedSockets;
}

exports.addSpam = function(id) {
	var socket, updatehash = {};

	try {
		socket = connectedSockets[id][0];
		var muted = socket.muted;
	} catch(e) {console.log("ERROR! Socket with id %s is not connected!", id)}

	if (socket.muted) { //check if user can talk
		var canTalk = moment().diff(socket.mutedTill) > 0;
		if (canTalk) setField(id, {muted: false});

		return;
	}

	var lastInteraction = moment.duration(moment().diff(socket.lastInteraction)).asSeconds();
	updatehash.lastInteraction = moment();

	if (lastInteraction < 2) updatehash.score = socket.score+1; //spamming
	else { //good boy
		var newScore = Math.max(socket.score - Math.round(lastInteraction), 0);
		updatehash.score = newScore;

	    if (socket.muteLevel >= 0) { // 20 min of silence = lower Mute level
	    	var lastMute = moment.duration(moment().diff(socket.lastMute)).asSeconds();
	    	if (lastMute >= 1200) {
		    	updatehash.lastMute = moment();
		    	updatehash.muteLevel = socket.muteLevel-1;
	    	}
	    }
	}

	setField(id, updatehash);

	if (socket.score >= options.muteThreshold) { //muted!
		var mutehash = {};
		if (socket.muteLevel < 5) mutehash.muteLevel = socket.muteLevel+1;
		mutehash.score = 0;
		mutehash.mutedTill = moment().add(options.muteSeconds[socket.muteLevel], 'seconds');
		mutehash.muted = true;
		mutehash.lastMute = moment();

		setField(id, mutehash);

		eventEmitter.emit('muted', id, mutedTill.toDate());
	}

}

function setField(id, hash) {
	connectedSockets[id].forEach(function(socket) {
		console.log(socket);
		Object.assign(socket.user.spam, hash);
	});
	// DBBBBBB
	console.log('DBBBBBBBBBBBBBBBBBBBBBBBBBBBB');
}

exports.event = eventEmitter;
exports.antiSpam = exports;