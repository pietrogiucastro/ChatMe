var MongoClient = require('mongodb').MongoClient;
var CryptoJS = require("crypto-js");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/chatme');
var moment = require('moment');

var deepPopulate = require('mongoose-deep-populate')(mongoose);

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
    created: {
        type: Date,
        default: Date.now()
    },
    active: {
        type: Boolean,
        default: true
    },
    pmlist: [{
	    type: Schema.Types.ObjectId,
	    ref: 'PmRoom'
    }],
    activerooms: { type: Schema.Types.Mixed, default: {} },
    joinedroom: { type: String, default: 'global' },
    background: { type: Buffer, default: new Buffer(0) },
    spam: {
        lastInteraction: {type: Date, default: moment()},
        score: {type: Number, default: 0},
        muteLevel: {type: Number, default: 0},
        lastMute: {type: Date, default: moment()},
        muted: {type: Boolean, default: false},
        mutedTill: Date
    }
});
userSchema.plugin(deepPopulate);

var messageSchema = new Schema({ //Message schema
    type: String,
    text: String,
    time: Date,
    duration: Number,
    ownername: String,
    roomname: String,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

var mediaSchema = new Schema({ //Media schema
    buffer: Buffer,
    preview: String,
    type: String,
    roomname: String,
    messageid: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }
});

var roomSchema = new Schema({ //Room schema
    name: String,
    password: String,
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    iscustom: Boolean
});
var pmRoomSchema = new Schema({
    name: String,
    history: [{
        type: Schema.Types.ObjectId,
        ref: 'Message'
    }],
    recipientnamefor: Schema.Types.Mixed,
    unseen: Schema.Types.Mixed,
    lastmsg: {
    	type: Schema.Types.ObjectId,
        ref: 'Message'
    }
});


var User = mongoose.model('User', userSchema);
var Message = mongoose.model('Message', messageSchema);
var Media = mongoose.model('Media', mediaSchema);
var Room = mongoose.model('Room', roomSchema);
var PmRoom = mongoose.model('PmRoom', pmRoomSchema);


mediaSchema.pre('remove', function(next) {
    Room.update({
        name: this.roomname
    }, {
        $pull: {
            media: this._id
        }
    })
});

//create pre for removing all messages in room when removing room (populate them)


function AesEncrypt(text) {
    var ciphertext = CryptoJS.AES.encrypt(text, secretkey);
    return ciphertext.toString();
}

function AesDecrypt(ciphertext) {
    var bytes = CryptoJS.AES.decrypt(ciphertext, secretkey);
    var plaintext = bytes.toString(CryptoJS.enc.Utf8);
    return plaintext;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

module.exports = {
    createUser: function(username, password, email, callback) {
        User.find({
            name: username
        }, function(err, users) {
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
                username.match(':') ||
                username.match(' ') ||
                username.match('/') ||
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
            if (password.length < 4 || password.length > 18) {
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
            var token = AesEncrypt(username + ' ' + codedp);
            connection.collection('users').insert(newuser, function(err) {
                callback(err, token);
            });
        });
    },
    findUserByCredentials: function(username, password, callback) {
        var codedp = new Buffer(password).toString('base64');
        User.findOne({
            name: username,
            codedp: codedp
        }, '-background', function(err, user) {
            if (err || !user) {
                callback(err);
                return;
            }
            callback(null, user);
        });
    },
    getUserBackground: function(userid, callback) {
        User.findOne({_id: userid}, 'background', (err, user) => {
            if (err || !user.background) return callback(err);

            callback(null, user.background);
        });
    },
    getTokenByCredentials: function(username, password, callback) {
        this.findUserByCredentials(username, password, function(err, user) {
            if (err || !user) {
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
        if (!(credentials.length - 1)) {
            callback();
            return;
        }
        var username = credentials[0];
        var password = new Buffer(credentials[1], 'base64').toString('ascii');
        this.findUserByCredentials(username, password, callback);
    },
    findUserByName: function(username, callback) {
        User.findOne({
            name: username
        }, '-background', function(err, user) {
            if (err || !user) return callback(err, user);

            user.codedp = undefined;
            callback(null, user);
        });
    },
    queryUserNamesMatches: function(userquery, callback) {
    	userquery = new RegExp(userquery, 'i');
    	var userslist = User.aggregate([ {$match: {name: userquery}}, {$group: {_id: '$name'}}, {$limit: 50 } ], function(err, userslist) {
    		if (err || !userslist) callback(err, userslist);
    		callback(null, userslist.map(el => {return el._id}));
    	})
    },
    updateUserData: function(id, userdata, callback) {
        User.update({
            _id: id
        }, {
            $set: userdata
        }, callback);
    },
    createMessage: function(userid, roomname, msgdata, callback) {
        var msg = new Message(msgdata);
        connection.collection('messages').insert(msg, function(err, message) {
            if (err) return callback(err);

            Room.update({
                name: roomname
            }, {
                $push: {
                    history: {
                        $each: [msg._id],
                        $slice: -100
                    }
                }
            }, callback);
        });
    },
    createPmMessageAndUpdate: function(userid, recipientid, roomname, msgdata, callback) {
        var queryinc = {};
        queryinc["unseen." + recipientid] = 1;

        var msg = new Message(msgdata);
        connection.collection('messages').insert(msg, function(err, message) {
            if (err) return callback(err);

            PmRoom.findOneAndUpdate({
                name: roomname
            }, {
                $push: {
                    history: {
                        $each: [msg._id],
                        $slice: -100
                    } // remove slice next
                },
                $inc: queryinc,
                $set: {lastmsg: msg._id}
            }, function(err, room) {
                if (err) return callback(err);
                if (!room) return callback("ERROR! No pmroom found in db with name " + roomname);

                User.find({
                	'_id': { $in: [
            			mongoose.Types.ObjectId(userid),
            			mongoose.Types.ObjectId(recipientid)
        			]}
                }, function(err, users) {
                	if (err || !users.length) return callback(err, users);

                	users.forEach(user => {
	                	var pmlist = user.pmlist;
	                	var roomid = room._id;

	                	var roomindex = pmlist.indexOf(roomid);
	                	if (roomindex != -1) pmlist.splice(roomindex, 1);
	                	pmlist.push(roomid);
	                	user.pmlist = pmlist;
	                	user.save();
                	});
                	callback(null, users);
                });
            });
        });
    },
    getPmList: function(userid, callback) {
    	User.findById(userid).deepPopulate('pmlist.lastmsg').exec(function(err, user) {
			if (err || !user) callback(err, user);

			var pmlist = user.pmlist;
			pmlist.forEach(pmroom => {
				var recipientname = pmroom.recipientnamefor[userid.toString()];

				pmroom.unseen = pmroom.unseen[userid.toString()];
				pmroom.recipientnamefor = recipientname;

				pmroom.history = undefined;
				pmroom.name = undefined;

				if (pmroom.lastmsg.type == 'audio')
                    pmroom.lastmsg.text = '<span class="pm-audio-ico">audio</span>';
                else if (pmroom.lastmsg.type == 'image')
					pmroom.lastmsg.text = '<span class="pm-image-ico">image</span>';
				else
					pmroom.lastmsg.text = pmroom.lastmsg.text.substr(0, 60);
			});
			callback(null, pmlist);
    	});
    },
    clearPmUnseenForId: function(roomname, userid, callback) {
    	var setquery = {};
    	setquery['unseen.' + userid] = 0;
    	PmRoom.update({name: roomname}, {
    		$set: setquery
    	}, function(err, result) {
    		if (err) callback(err);
    		if (!result.nModified) {
                // this means room does not. Exists. It is normal when a user join a new pm room
            }
    	});
    },
    deleteMessageById: function(messageid, callback) {
        Message.find({
            _id: messageid
        }).remove(callback);
    },
    getRoomHistory: function(roomname, callback) {
        Room.findOne({
            name: roomname
        }).populate('history').exec(function(err, messages) {
            if (err) return callback(err);
            if (!messages) return callback();

            callback(null, messages);
        });
    },
    getRooms: function(callback) {
        Room.find().populate('history').exec(function(err, rooms) {
            if (err) return callback(err);
            if (!rooms) return callback();

            var result = {
                rooms: {},
                customrooms: []
            };
            rooms.forEach(room => {
                result.rooms[room.name] = {
                    password: room.password,
                    history: room.history,
                    users: {},
                    userslist: [],
                    iscustom: room.iscustom
                }
                if (room.iscustom) {
                    result.customrooms.push(room.name);
                }
            });

            callback(null, result);
        });
    },
    createRoom: function(roomdata, callback) {
        this.findRoomByName(roomdata.roomname, function(err, roomexists) {
            if (err || roomexists) return callback(err, null);

            var newroom = new Room(roomdata);
            connection.collection('rooms').insert(newroom, callback);
        });
    },
    findRoomByName: function(roomname, callback) {
        Room.findOne({
            name: roomname
        }, function(err, room) {
            if (err || !room) {
                callback(err, room);
                return;
            }
            callback(null, room);
        });
    },
    findRoomsByNameMatch: function(roomname, callback) {
        Room.find({
            name: '%' + roomname + '%'
        }, function(err, rooms) {
            if (err) return callback(err);

            var result = rooms.map(function(room) {
                return {
                    name: room.name,
                    haspassword: !!room.password
                };
            });
            callback(null, result);
        });
    },
    createGetPmRoom: function(roomdata, callback) {

        PmRoom.findOne({
            name: roomdata.name
        }).populate('history').exec(function(err, pmroom) {
            if (err || pmroom) return callback(err, {
            	history: pmroom.history,
            	iscustom: false,
            	users: {},
            	userslist: [],
            	recipientnamefor: pmroom.recipientnamefor,
            	unseen: pmroom.unseen
            }); //return pmroom if already exists

            var unseendata = {};
            unseendata[roomdata.ids[0]] = 0;
            unseendata[roomdata.ids[1]] = 0;

            var newpmroom = new PmRoom({
                name: roomdata.name,
                recipientnamefor: roomdata.recipientnamefor,
                unseen: unseendata
            });
            connection.collection('pmrooms').insert(newpmroom, err => {
                callback(err, {
                	history: [],
	            	iscustom: false,
	            	users: {},
	            	userslist: [],
	            	recipientnamefor: newpmroom.recipientnamefor,
	            	unseen: newpmroom.unseen
                });
            });

        });
    },
    createMedia: function(roomname, mediadata, callback) {
        mediadata.roomname = roomname;

        var newmedia = new Media(mediadata);
        connection.collection('media').insert(newmedia, err => {
            callback(err, newmedia);
        });
    },
    findMedia: function(mediadata, callback) {
        Media.findOne(mediadata, callback);
    },
    getMediaPreview: function(mediadata, callback){
        Media.findOne(mediadata, 'preview', callback);
    },
    deleteMedia: function(mediadata, callback) {
        Media.findOne(mediadata).remove(callback);
    },
    getNewId: function() {
        return mongoose.Types.ObjectId();
    },
    reset: function() {
        Media.find().remove().exec();
        Room.find().remove(function() {
            var newroom = new Room({
                name: 'global',
                iscustom: false
            });
            connection.collection('rooms').insert(newroom);
        });
        Message.find().remove().exec();
        PmRoom.find().remove().exec();
        console.log('reset executed.');
    }
};