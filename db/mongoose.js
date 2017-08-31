var MongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatme');

var Schema = mongoose.Schema;
var connection = mongoose.connection;

var userSchema = new Schema({ //User schema
	name: String,
	token: String,
	color: String,
	status: String
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
	createtUser: function(userdata, callback) {
		var newuser = new User(userdata);
		connection.collection('users').insert(newuser, callback);
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

