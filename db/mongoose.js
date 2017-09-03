var MongoClient = require('mongodb').MongoClient;
var CryptoJS = require("crypto-js");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatme');

var Config = require('../environment'),
	conf = new Config();

var secretkey = conf.AES_SECRET;

var Schema = mongoose.Schema;
var connection = mongoose.connection;

var userSchema = new Schema({ //User schema
	name: String,
	codedp: String,
	email: String,
	color: String,
	status: String,
	created: {type: Date, default: Date.now()},
	active: {type: Boolean, default: true}
});
var messageSchema = new Schema({ //Message schema
	type: String,
	text: String,
	time: Number,
	owner: Schema.Types.ObjectId,
});
var mediaObjectSchema = new Schema({ //MediaObject schema
	id: String,
	buffer: Buffer
});

var roomSchema = new Schema({
	name: String,
	password: String,
	history: [Schema.Types.ObjectId],
	users: Schema.Types.Mixed,
	userslist: [String],
	audios: Schema.Types.Mixed
});

var User = mongoose.model('User', userSchema);
var Message = mongoose.model('Message', messageSchema);
var MediaObject = mongoose.model('MediaObject', mediaObjectSchema);
var Room = mongoose.model('Room', roomSchema);


function AesEncrypt(text) {
	var ciphertext = CryptoJS.AES.encrypt(text, secretkey);
	return ciphertext.toString();
}

function AesDecrypt(ciphertext) {
	var bytes  = CryptoJS.AES.decrypt(ciphertext, secretkey);
	var plaintext = bytes.toString(CryptoJS.enc.Utf8);
	return plaintext;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

User.find({}, function(err, users) {
	if (err) {
		return console.log(err);
	}

	//console.log(users);
	users.forEach(function(user) {
		console.log(user);
	});
});

module.exports = {
	createUser: function(username, password, email, callback) {
		//check if username already exists
		User.find({name: username}, function(err, users) {
			if (err) {
				callback(err);
				return;
			}
		   // errors handler //
			if (users.length) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Username already exists"
				});
				return;
			}
			if (username.length > 10 || username.length < 4) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Username length must be between 4 and 10 characters"
				});
				return;
			}
			if (username.match(';') ||
				username.match(' ') ||
				username.match('<') ||
				username.match('>')) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Username must not contain spaces or special symbols"
				});
				return;
			}
			if (username.toLowerCase() == 'you' ||
				username.toLowerCase() == 'admin') {
				callback({
					type: "cm-error",
					result: "error",
					error: "Forbidden name"
				});
				return;
			}
			if (password.length < 4 || password.length > 18 ) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Password length must be between 4 and 18 characters"
				});
				return;
			}
			if (password.match(' ')) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Password must not contain spaces"
				});
				return;
			}
			if (!validateEmail(email)) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Email not valid"
				});
				return;
			}
		   // ============== //
		   	var codedp = new Buffer(password).toString('base64');
			var newuser = new User({
				name: username,
				codedp: codedp,
				email: email,
				color: 'default',
				status: 'online'
			});
			connection.collection('users').insert(newuser, callback);
		});
	},
	findUserByCredentials: function(username, password, callback) {
		var codedp = new Buffer(password).toString('base64');
		User.find({name: username, codedp: codedp}, function(err, users) {
			if (err || !users.length) {
				callback(err);
				return;
			}
			var user = users[0];
			callback(null, user);
		});
	},
	getTokenByCredentials: function(username, password, callback) {
		this.findUserByCredentials(username, password, function(err, user) {
			if(err || !user) {
				callback(err);
				return;
			}
			var username = user.name;
			var codedp = user.codedp;
			var token = AesEncrypt(username + ' ' + codedp);
			callback(null, token);
		});
	},
	findUserByToken: function(token, callback) {
		var credentials = AesDecrypt(token).split(' ');
		if (!(credentials.length-1)) {
			callback();
			return;
		}
		var username = credentials[0];
		var password = new Buffer(credentials[1], 'base64').toString('ascii');
		this.findUserByCredentials(username, password, callback);
	},
	updateUserData: function(id, userdata, callback) {
		User.update({_id: id}, {$set: userdata}, callback);
	},
	createMessage: function(roomname, messagedata, callback) {
		connection.collection('messages').insert(messagedata, function(err, message) {
			
			if(err) {
				callback(err);
				return;
			}
			Room.find({name: roomname}, function(err, rooms) {
				if (err) {
					callback(err);
					return;
				}
				if (!rooms.length) {
					callback("ERROR! No rooms found");
					return;
				}
				var room = rooms[0];
				room.history.push(message._id);
				room.save(callback);
			});

		});
	},
	createRoom: function(roomdata, callback) {
		var newroom = new Room(roomdata);
		connection.collection('rooms').insert(newuser, callback);
	},
	findRoomsByName: function(roomname, callback) {
		Room.find({name: '%'+roomname+'%'}, function(err, rooms) {
			if (err) {
				callback(err);
				return;
			}
			var result = rooms.map(function(room) {
				return {name: room.name, password: room.password};
			});
			callback(null, result);
		});
	}
	
};

