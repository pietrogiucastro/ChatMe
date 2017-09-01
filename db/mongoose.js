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
	token: String,
	email: String,
	color: String,
	status: String,
	created_at: {type: Date, default: Date.now()}
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

/*
var newuser = new User({
	name: 'username',
	token: 'asdasasasdda',
	color: 'yellow',
	status: 'online'
});

*/
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
			}
			if (username.toLowerCase() == 'you' ||
				username.toLowerCase() == 'admin') {
				callback({
					type: "cm-error",
					result: "error",
					error: "Forbidden name"
				});
			}
			if (password.length < 4 || password.length > 18 ) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Password length must be between 4 and 18 characters"
				});
			}
			if (!validateEmail(email)) {
				callback({
					type: "cm-error",
					result: "error",
					error: "Email not valid"
				});
			}
		   // ============== //

			var token = AesEncrypt(username+';'+password);
			var newuser = new User({
				name: username,
				token: token,
				color: 'default',
				status: 'online'
			});
			connection.collection('users').insert(newuser, callback);
		});
	},
	findUserByCredentials: function(username, password, callback) {
		var token = AesEncrypt(username+';'+password);
		User.find({token: token}, function(err, users) {
			if (err) {
				callback(err);
				return;
			}
			if (!users.length) {
				callback();
				return;
			}
			var user = users[0];
			callback(null, user);
		});
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

