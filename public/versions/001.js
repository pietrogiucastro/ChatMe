var settings_page = 'chat.me';
var server = document.domain;
var latestClientVersion = "1.0.8";
var myClientVersion;

var site = (window.location != window.parent.location) ? document.referrer : document.location.href;

function url_domain(data) {
	var a = document.createElement('a');
	a.href = data;
	return a.hostname;
}

site = 'site://' + url_domain(site);

var socket;
var displaytype;
var selectedsize;
var selectedtheme;

var collapsetabs = $.cookie('collapsetabs') == 'true';
var chatslide = $.cookie('chatslide') == 'true';
var custombg = $.cookie('custombg') == 'true';
var transparent = $.cookie('transparent') == 'true';

var sess_token = $.cookie('sess_token');
var sess_user;

var prevtyping = false;
var onmodalclose;

var options = $('#chat-me-options');
var spinner = $('<center id="opts-spinner-cont" style="display:none;"><div class="opts-spinner"></div></center>');
$('#chat-me').prepend(spinner);


var input;
var attachinput = $('<input class="hidden" type="file" id="cm-attach" accept="image/*">');
var micbtn = $('<span style="position:absolute; top:0; right:0;" id=cm-record class=cm-button><i class="fa fa-microphone micico"></i> <span class="rec-btns"> <span class="recbtn rec-accept"></span><span class="recbtn rec-cancel"></span> </span></span>');
var mictime = $('<span class="record-time" style="display:none;">00:00</span>');

var fullImageCover = $('<div id="full-image-cover"></div>');
var fullImageBtns = $('<div id="full-image-btns"><span class="fullimg-down fa-fw"></span><span class="fullimg-close fa-fw"></span></div>');
var fullImage = $('<div id="full-image"></div>');

var msgnotSound = new Audio('/sounds/not1.mp3');
var pmnotSound = new Audio('/sounds/pmnot.mp3');
var emojinotSound = new Audio('/sounds/pmnot.mp3');

var mute = false;
var showusers = true;
var unseenmsgs = 0;

var chats = {
	global: {
		volume: true
	},
	site: {
		volume: true
	}
};
var currentchat;
var emptychatmsg = 'Empty chat. Be the first to send a message!';

var currentchat;
var currentusers = {};

var tabs = $('<div id="chat-me-head"><div id="chat-me-tabs" class="cm-scroll scroll-x cm-tabs-scroll"><div class="chat-tab base global-tab noselect" name="global" data-type="global"><span class="volume-icon vol-true"></span><div class="tab-text">Global</div></div><div class="chat-tab base site-tab noselect" name="site" data-type="site"><span class="volume-icon vol-true"></span><div class="tab-text">Site</div></div></div><div id="pm-msgs"></div></div>');
var msgbtn = $('<div id="pm-msgs-btn"><div class="pm-msgs-nots" style="display:none;"></div></div>');
var msgnots = msgbtn.find('.pm-msgs-nots');

tabs.find('#pm-msgs').append(msgbtn);

var roomresultModel = $('<div class="chat-row"><span class="chat-name"></span> <span class="chat-online"><i class="fa fa-user" style="margin-right:4px;"></i><span class="online-num"></span></span></div>')[0];
var messagemodal = $('<div class="cm-message-modal" style="display:none;"><div class="modal-layout cm-scroll"><div class="modal-close"></div><div class="message-modal-body"></div></div></div>');
var pmModal = $('<div class="pm-msgs-modal" style="z-index:1000; display:none;"><div class="pm-close"></div><div class="modal-body cm-scroll"><div class="pm-title">Private Messages</div><div class="pm-search cm-clearafter"><span class="pm-btn pm-add-btn"><input class="pm-add-input" style="display:none;" placeholder="add new user"><span class="pm-clear-search"></span></span><span class="pm-btn pm-search-btn"><span class="pm-clear-search"></span><input class="pm-search-input" style="display:none;" placeholder="search user"></span></div><div class="pm-results-cont" style="display: none;"><div class="search-results"></div></div><div class="pm-messages"></div></div></div>');
var pmnot = 0;
var pmMessage = $('<div class="pm-message"><div class="pm-head cm-clearafter"><div class="pm-name"></div><div class="pm-date update-date"></div></div><div class="pm-body"><div class="pm-text"><span class="pm-msgowner"></span></div><div class="pm-not"></div></div>')[0];

var emojismatcher = {
	emojis: {
		':smsad:' : {name: 'smileysmsad.png', category: 'images'},
		':smile:' : {name: 'smileyface.png', category: 'images'},
		':smiled:' : {name: 'smileyfaceD.png', category: 'images'},
		':kiss:' : {name: 'smileykiss.png', category: 'images'},
		':smileo:' : {name: 'smileyO.png', category: 'images'},
		':smilep:' : {name: 'smileyP.png', category: 'images'},
		':sad:' : {name: 'smileysad.png', category: 'images'},
		':ssad:' : {name: 'smileyssad.png', category: 'images'},
		':smilew:' : {name: 'smileyw.png', category: 'images'},
		':smilexd:' : {name: 'smileyxd.png', category: 'images'},
		':smilexxd:' : {name: 'smileyxxd.png', category: 'images'},
		':thumb:' : {name: 'thumb.png', category: 'images'},
		':heart:' : {name: 'heart.png', category: 'images'},
		':angelol:': {name: 'angelol.png', category: 'images'},

		':sunglasses_g:' : {name: 'sunglasses.gif', category: 'gifs'}
	},
	setter: {}
};

for (var key in emojismatcher.emojis) {
	var category = emojismatcher.emojis[key].category;
	emojismatcher.setter[category] = emojismatcher.setter[category] || [];
	emojismatcher.setter[category].push(key);
}

var emojis = $('<div id="emojis" class="noselect"> <div class="emoji-tabs"> <div class="emoji-tab active" target="images"></div><div class="emoji-tab" target="gifs"></div> </div> <div class="emoji-body"> <div class="emoji-overflow cm-scroll"> <div class="emoji-category cm-clearafter images active"></div> <div class="emoji-category cm-clearafter gifs"></div> </div> </div> </div>');

for (var category in emojismatcher.setter) {
	emojismatcher.setter[category].forEach(key => {
		var emojipath = emojismatcher.emojis[key].category + '/' + emojismatcher.emojis[key].name;
		emojis.find('.emoji-body .'+category).append('<div class="emoji" data-key="'+key+'"><img src="/emo/'+emojipath+'"></div>');
	});
}


// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show
// some notification and exit


(function() {
	'use strict';

	if (document.domain == settings_page) document.write('chat me settings. Under construction..');

	if (!window.WebSocket) {
		$('body').css('background-color', '#ddd').html($('<center>', {
			text: 'Sorry, but your browser doesn\'t support WebSocket. Please try with another browser.'
		}));
        //handle disable code
        return;
    }

    function refreshUnseenIcon() {
    	unseenmsgs = $('.cm-unseen').length;
    	if (unseenmsgs) {
    		$('#unseen-icon').html(unseenmsgs);
    		$('#unseen-icon').stop().fadeIn('fast');
    	} else
    	$('#unseen-icon').fadeOut();
    }

    function isToRescroll() {
        var RANGE = 30 //px;
        return $('#cm-chat')[0].scrollTop >= $('#cm-chat')[0].scrollHeight - $('#cm-chat').height() - RANGE;
    }

    function isScrolledIntoView(elem) {
    	var docViewTop = $(window).scrollTop();
    	var docViewBottom = docViewTop + $(window).height();

    	var elemTop = $(elem).offset().top;
    	var elemBottom = elemTop + $(elem).height();

    	return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
    }

    function setDisplayStyle(type) {
    	displaytype = type;
    	$('#chat-me').removeClass().addClass(type);
    }

    function setEmojis(text, callback) {
    	var emoji = emojismatcher.emojis[text];
    	if (emoji) {
    		var emojipath = emoji.category+'/'+emoji.name;
    		text = '<div class="emoji-msg"><img src="/emo/'+emojipath+'"></div>';
    	}
    	callback(!!emoji);
    	return text;
    }

    function prepareMessage(msg, history) {
    	var roomname = $('.chat-tab.sel').attr('name');
    	if ($('.empty-chat-msg').length) {
    		$('.empty-chat-msg').slideUp(function() {
    			$(this).remove();
    		});
    	}

    	msg.text = setEmojis(msg.text, isemoji => {
    		msg.isemoji = isemoji;

    		var chatvolume = chats[roomname].volume;
    		if (!history && chatvolume && !mute) {
    			PlayMsgNot(isemoji);
    		}
    	});

    }

    function setMessage(msg, history, fadein, noslide) {
    	prepareMessage(msg, history);

    	var message;
        if (msg.type == 'user_msg') { //message
        	message = createTextMessage(msg);
        } else if (msg.type == 'audio') { //audio
        	message = createAudioMessage(msg);
        } else if (msg.type == 'image') {
        	message = createImageMessage(msg);
        } else {
        	showModalMessage("Some messages can't be processed. Please try again later.");
        	console.log("unknown message type for msg: " + JSON.stringify(msg));
        	return;
        }
        var onlineOwner = currentusers[msg.ownername];
        if (!onlineOwner) { //offline user
        	message.find('.cm-message-name').addClass('user-offline');
        }
        else {
        	message.find('.cm-message-name').css('color', onlineOwner.color);
        }

        function unseenmsg() {
        	$(message).addClass('cm-unseen');
        	refreshUnseenIcon();
        }
        if (noslide) { //no animation
        	message.show();
        } else if (history) {
        	fadein(message);
        } else { // send single message
        	if (message.is('.cm-message-text')) message.slideDown('fast');
        	else message.show('slide');

        	if (isScrolledIntoView(message)) slidebottom();
        	else unseenmsg();
        }
    }

    function createTextMessage(msg) {
    	var user_message = sess_user == msg.ownername ? 'You' : msg.ownername;
    	var time = timeSince(msg.time);

    	var lastmessage = $('#cm-chat-list').children(':last');

        // if (!msg.isemoji && lastmessage.is('.cm-textmessage') && lastmessage.data('owner') == 'user-' + msg.ownername) {
        //     var textline = $('<span class="cm-message-text" style="display:none;">' + msg.text + '</span>');
        //     lastmessage.find('.cm-message-body').append(textline);
        //     return textline;
        // } else {
        //     var newtextmessage = $('<div class="cm-message cm-textmessage cm-clearafter" data-owner="user-' + msg.ownername + '" style="display:none;"></div>');
        //     newtextmessage.html('<div class="cm-message-body"><div class="cm-message-head cm-clearafter"><span class="cm-message-name user-' + user_message + ' floatleft" style="color: ' + usercolor + ';" data-name="' + msg.ownername + '">' + user_message + '</span><span class=cm-message-date>' + time + '</span></div><span class=cm-message-text>' + msg.text + '</span></div>');
        //     if (user_message == 'You') newtextmessage.find('.cm-message-body').addClass('user-You textright');
        //     $('#cm-chat-list').append(newtextmessage);
        //     return newtextmessage;
        // }

        var newtextmessage = $('<div class="cm-message cm-textmessage cm-clearafter" data-date="'+msg.time+'" data-owner="user-' + msg.ownername + '" style="display:none;"></div>');
        newtextmessage.html('<div class="cm-message-body"><div class="cm-message-head cm-clearafter"><span class="cm-message-name user-' + user_message + ' floatleft" data-name="' + msg.ownername + '">' + user_message + '</span><span class="cm-message-date update-date">' + time + '</span></div><span class=cm-message-text>' + msg.text + '</span></div>');
        if (user_message == 'You') newtextmessage.find('.cm-message-body').addClass('user-You textright');
        $('#cm-chat-list').append(newtextmessage);

        if (lastmessage.data('owner') == 'user-' + msg.ownername) {
            // newtextmessage.find('.cm-message-name').remove();
        }
        
        return newtextmessage;

    }

    function createAudioMessage(msg) {
    	var user_message = sess_user == msg.ownername ? 'You' : msg.ownername;
    	var time = timeSince(msg.time);

    	var progressbar = $('<span class="progress-bar"></span');
    	var audiobar = $('<span class="audionav-body"><input type="range" min="0" max="100" class="audio-track" value="0"></span>');
    	audiobar.append(progressbar);
    	var audioduration = $('<span class="audio-duration">..:..</span>');
    	audioduration.html(recorder.getTimeByMs(msg.duration));

    	var downloadbutton = $('<a class="download-button"></a>')
    	.one('click', function() {
    		$(this).addClass('downloading');
        	socket.emit('get media', msg._id, setAudioMessage);
        });

    	var audio = document.createElement('audio');
    	audio.className = 'main-audio';
    	audio.setAttribute('preload', 'auto');


    	var newaudiomessage = $('<div class="cm-message cm-audiomessage cm-clearafter" data-date="'+msg.time+'" data-owner="user-' + msg.ownername + '" style="display:none;"></div>');
    	newaudiomessage.html('<div class="cm-message-body cm-audio-body"><div class="cm-message-head cm-clearafter"><span class="cm-message-name user-' + user_message + ' floatleft" data-name="' + msg.ownername + '">' + user_message + '</span><span class="cm-message-date update-date">' + time + '</span></div><div class=cm-message-audio></div></div>')
    	.find('.cm-message-audio')
    	.append(downloadbutton)
    	.append(audiobar)
    	.append(audio)
    	.append(audioduration);

    	if (user_message == 'You') newaudiomessage.find('.cm-message-body').addClass('user-You');

    	var lastmessage = $('#cm-chat-list').children(':last');
    	if (lastmessage.data('owner') == 'user-' + msg.ownername) {
            // newaudiomessage.find('.cm-message-name').remove();
        }

        newaudiomessage.attr('id', msg._id);
        $('#cm-chat-list').append(newaudiomessage);

        return newaudiomessage;
    }

    function setAudioMessage(msg) {

    	var audiocont = $('#' + msg.id);

    	var audio = audiocont.find('.main-audio')[0];
    	var audioduration = audiocont.find('.audio-duration');
    	var audiobar = audiocont.find('.audionav-body');
    	var downloadbutton = audiocont.find('.download-button');
    	var playbutton = $('<a class="play-button paused fa-fw" href="#"></a>')
    	.click(toggleAudioByBtn);

    	var blob = new Blob([msg.buffer], {
    		'type': 'audio/ogg; codecs=opus'
    	});
    	audio.src = window.URL.createObjectURL(blob);
    	console.log(blob.size);

    	audio.currentTime = 999999999999999999999999999999999;
    	audio.play();

        $(audio).on('durationchange', function() { // set audio
        	var duration = audio.duration * 1000;
        	if (!duration || duration == Infinity) return;

        	var messageaudio = $(this).parent();

        	setAudioThumbMax(messageaudio, duration);
        	audioduration.html(recorder.getTimeByMs(duration));

        	var updatePrgoressBarFunc = function() {
        		uploadAudioThumb(messageaudio, audio.currentTime * 1000);
        		uploadProgressBar(messageaudio, audio.currentTime * 1000, duration);
        		if (audio.currentTime == audio.duration) {
        			stopAudio(messageaudio);
        			updatePrgoressBarFunc();
        		}
        	};
        	var updateTimeProgressFunc = function() {
        		audioduration.html(recorder.getTimeByMs(audio.currentTime * 1000))
        	}
        	var updateBarInterval;
        	var updateTimeInterval;
        	var updateBarProgressInterval;

        	this.onplay = function() {
        		updateTimeProgressFunc();
        		updateBarInterval = setInterval(updatePrgoressBarFunc, 50);
        		updateTimeInterval = setInterval(updateTimeProgressFunc, 100);
        	};

        	this.onpause = function() {
        		clearInterval(updateBarInterval);
        		clearInterval(updateTimeInterval);
        		audioduration.html(recorder.getTimeByMs(duration));
        	};

        	audiobar.find('.audio-track').mousedown(function() {
        		$(this).addClass('dragging');
        		var rangeInput = $(this);
        		updateBarProgressInterval = setInterval(function() {
        			uploadProgressBar(messageaudio, parseInt(rangeInput.val()), parseInt(rangeInput.attr('max')));
        		}, 50);
        	}).mouseup(function() {
        		$(this).removeClass('dragging');
        		clearInterval(updateBarProgressInterval);
        		var newtime = this.value / 1000;
        		audio.currentTime = newtime;
        	});

        	downloadbutton.replaceWith(playbutton);
        });
    }

    function createImageMessage(msg) {
    	var user_message = sess_user == msg.ownername ? 'You' : msg.ownername;
    	var time = timeSince(msg.time);

    	var newimagemessage = $('<div class="cm-message cm-imagemessage cm-clearafter" data-date="'+msg.time+'" data-owner="user-' + msg.ownername + '" style="display:none;"></div>');
    	newimagemessage.html('<div class="cm-message-body cm-image-body"><div class="cm-message-head cm-clearafter"><span class="cm-message-name user-' + user_message + ' floatleft" data-name="' + msg.ownername + '">' + user_message + '</span><span class="cm-message-date update-date">' + time + '</span></div><div class="cm-message-image notloaded"><div class="img-square"></div><img></div><span class="cm-message-text">' + msg.text + '</span></div>');
    	if (user_message == 'You') newimagemessage.find('.cm-message-body').addClass('user-You textright');

    	socket.emit('get mediapre', msg._id, function(image) {
    		newimagemessage.find('.cm-message-image.notloaded img').attr('src', image.preview);
    	});

    	newimagemessage.find('.cm-message-image.notloaded').one('click', function() {
    		var that = $(this);
    		that.removeClass('notloaded').addClass('loading');
    		socket.emit('get media', msg._id, function(image) {
    			that.removeClass('loading');

    			var blob = new Blob([image.buffer], {
    				'type': 'image/jpeg'
    			});

    			var imgurl = window.URL.createObjectURL(blob);

    			that.children('img').attr('src', imgurl);
    			that.click(function() {
    				showFullImg(that.children('img'));
    			});
    		});
    	});

    	$('#cm-chat-list').append(newimagemessage);

    	return newimagemessage;
    }

    function setSystemMsg(msg, msgclass) {
    	var systemmsg = $('<div class="cm-system-msg"><hr><div class="system-text">' + msg + '</div><hr></div>');
    	if (msgclass) systemmsg.addClass(msgclass);
    	$('#cm-chat-list').append(systemmsg);

    	if (isScrolledIntoView(systemmsg)) scrollBottom();

    }

    function setHistory(msgs, noslide) {
    	$('#chat-me-cont #spinner').remove();

    	$('#cm-chat-list').empty();

    	if (!msgs.length) return setSystemMsg(emptychatmsg, 'empty-chat-msg');

    	var totalfadetime = 500;

    	var fadetick = Math.max(Math.min(totalfadetime / msgs.length, 20), 5);
    	var msgfadetime = 0;

    	msgs.forEach(function(msg) {
    		setMessage(msg, true, function(message) {
    			message.hide();
    			setTimeout(function() {
    				message.fadeIn(80);
    				scrollBottom();
    			}, msgfadetime);
    			msgfadetime += fadetick;
    		}, noslide);
    	});

    	if (noslide) scrollBottom();

    }

    function toggleAudioByBtn() {
    	if ($(this).is('.paused')) {
    		playAudio($(this).parent());
    	} else {
    		pauseAudio($(this).parent());
    	}
    }

    function playAudio(messageaudio) {
    	stopAllAudios();
    	$(messageaudio).find('.play-button').removeClass('paused');
    	var audio = $(messageaudio).find('.main-audio')[0];
    	audio.play();
    }

    function pauseAudio(messageaudio) {
    	$(messageaudio).find('.play-button').addClass('paused');
    	var audio = $(messageaudio).find('.main-audio')[0];
    	audio.pause();
    }

    function stopAudio(messageaudio) {
    	$(messageaudio).find('.play-button').addClass('paused');
    	var audio = $(messageaudio).find('.main-audio')[0];
    	audio.pause();
    	audio.currentTime = 0;
    }

    function stopAllAudios() {
    	$('#cm-chat').find('.cm-message-audio').each(function() {
    		pauseAudio(this);
    	});
    }

    function setAudioThumbMax(messageaudio, value) {
    	var audiotrack = messageaudio.find('.audio-track');
    	audiotrack.attr('max', value);
    }

    function uploadAudioThumb(messageaudio, currentTime) {
    	var audiotrack = messageaudio.find('.audio-track');
    	if (audiotrack.is('.dragging')) return;

    	audiotrack.val(currentTime);
    }

    function uploadProgressBar(messageaudio, currentTime, duration) {
    	var progressBar = messageaudio.find('.progress-bar');
    	var percent = (100 * (currentTime / duration)) + '%';
    	progressBar.css('width', percent);
    }

    function startRec(e) {
    	if (e && $(e.target).is('.recbtn')) return;
    	if (micbtn.is('.recording')) return;
    	mictime.html('00:00');
    	micbtn.addClass('recording')
    	.stop().animate({
    		width: '115px'
    	}, 200)
    	.find('.record-time').stop().animate({
    		width: 'show'
    	}, 180);
    	input.parent().stop().animate({
    		'padding-right': '120px'
    	}, 200);

    	recorder.record();
    }

    function sendRec() {
    	stopRecording();
    	recorder.stopAndSendRecord();
    }

    function cancelRec() {
    	stopRecording();
    	try {recorder.cancelRecord();}
    	catch(e) {
    		socket.emit('recording', false);
    	}
    }

    function stopRecording() {
    	micbtn.removeClass('recording').addClass('stopped')
    	.stop().animate({
    		width: '40px'
    	}, 200)
    	.find('.record-time').stop().animate({
    		width: 'hide'
    	}, 200);
    	input.parent().stop().animate({
    		'padding-right': '45px'
    	}, 200);
    }

    function scrollBottom() {
    	$('#cm-chat')[0].scrollTop = $('#cm-chat')[0].scrollHeight - $('#cm-chat').height();
    }

    function PlayMsgNot(emojinot) {
    	var msgsound = emojinot ? emojinotSound : msgnotSound;
    	msgsound.currentTime = 0;
    	msgsound.play();
    }

    function PlayPmNot() {
    	pmnotSound.currentTime = 0;
    	pmnotSound.play();
    }

    function showChatNot(roomname, msgtype) {
    	if ($('#cm-not').is(':visible') && $('#cm-not').is('.error')) return;

    	$('#cm-not').stop().hide();

    	var chatnotmsg =
    	roomname.startsWith('pm:') ?
    	'Joined user chat for ' + roomname.split('pm:')[1]:
    	'Joined chat ' + roomname;

    	if (msgtype == 'error') {
    		$('#cm-not').addClass('error');
    		chatnotmsg = roomname;            
    	}
    	else $('#cm-not').removeClass('error');

    	$('#cm-not').html(chatnotmsg).fadeIn(200, function() {
    		setTimeout(function() {
    			$('#cm-not').fadeOut('slow', function() {$(this).removeClass('error')});
    		}, 500);
    	});
    }

    function setUsers(users) {
    	$('#cm-online-list').empty();
    	currentusers = {};
    	for (var username in users) {
    		var user = users[username];
    		appendUser(user);
    	}
    }

    function appendUser(user) {
    	var status = user.status;
    	var typingclass = user.istyping ? ' typing' : '';
    	status.classname += typingclass;
    	$('#cm-online-list').prepend('<li class="cm-message-name cm-online-name" id="user-' + user.name + '" style="color:' + user.color + ';" data-name="' + user.name + '"><div class="username">' + user.name + '</div><div class="cm-message-status ' + status.classname + '">' + status.message + '</div></li>');
    	currentusers[user.name] = {color: user.color};
    }

    function refreshUser(user) {
    	removeUser(user.name);
    	appendUser(user);
    }

    function removeUser(username) {
    	$('#user-' + username).remove();
    	delete currentusers[username];
    }

    function UserMsgOnOff(username, isOnline) {
    	$('#cm-chat-list').children('.cm-message[data-owner=user-' + username + ']').each(function() {
    		var userdom = $(this).find('.cm-message-name');
    		if (isOnline) {
    			userdom.removeClass('user-offline');
    			refreshMsgsColor(username);
    		}
    		else userdom.addClass('user-offline');
    	});
    }

    function changeTyping(data) {
    	var status = $('#user-' + data.name).find('.cm-message-status');
    	if (data.istyping) status.addClass('typing');
    	else status.removeClass('typing');
    }

    function changeRecording(data) {
    	var username = $('#user-' + data.name).find('.username');
    	if (data.isrecording) username.addClass('user-recording');
    	else username.removeClass('user-recording');
    }

    function changeColor(data) {
    	console.log('change color');
    	console.log(data);
    	var username = data.name;
    	var userOnline = $('#user-' + username);
    	var color = data.color;
    	userOnline.css('color', color);
    	currentusers[data.name].color = data.color;
    	refreshMsgsColor(data.name);
    }

    function refreshMsgsColor(username) {
    	var usercolor = currentusers[username].color;
    	$('#cm-chat-list').children('.cm-message[data-owner=user-'+username+']').find('.cm-message-name').css('color', usercolor);
    }

    function postMessage() {
    	var msg = input.val();
    	if (msg.startsWith('/')) {
    		msg = msg.slice(1);
    		ActionMessage(msg);
    		input.val('');
    		return;
    	}

    	if (imgIsPending()) sendImg();
    	else if (msg) socket.emit('send message', msg);

    	if (msg) {
    		input.val('');
    		checkTyping();
    	}
    }

    function ActionMessage(msg) {
    	switch (msg) {
    		case 'quit':
    		InitDisplay();
    		break;
    		default:
    		console.log('unhandled action');
    	}
    }

    function InitDisplay() {
    	setDisplayStyle('init');
    	if (socket) socket.disconnect();
    	sess_token = '';
    	sess_user = '';
    	$.removeCookie('sess_token');

    	hideEmojis();
    	$('#chat-me').find(tabs).remove();
    	tabs.find('.chat-tab:not(.base)').remove();
    	$('#chat-me').prepend(inlinebtns.container);

    	$('#chat-me-cont').html('<div style="font-weight:bold; color:white; padding:5px; padding-bottom:10px; background:#8da4a7; margin: 8px -5px;">Login</div>')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-user class=cm-label>Username:</label><input style="margin-right:10px;" type=text id=cm-user class=cm-input placeholder=Username></div>')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-pass class=cm-label>Password:</label><input style="margin-right:10px;" type=password id=cm-pass class=cm-input placeholder=Password></div>')
    	.append('<br>')
    	.append('<br>')
    	.append('<div id=cm-error-cont></div>')
    	.append('<div style="position:absolute; bottom:30px; right:10px; width:140px;"><button style="left:0%; height:20px;" id=cm-login class=cm-button>Login</button><button style="right:0%; height:20px; background:transparent; color:white; text-decoration:none;" id=cm-register class=cm-button>Sign up</button></div>');

    	$('#cm-login').click(function() {
    		var user = $('#cm-user').val();
    		var pass = $('#cm-pass').val();
    		$('#cm-error-cont').empty();
    		showOptsWait();
    		$.post('/login', {
    			user: user,
    			pass: pass
    		}, function(e) {
    			hideOptsWait();
    			$('#cm-error-cont').html('');
    			if (e.result == 'success') {
    				sess_token = e.token;
    				$.cookie('sess_token', sess_token);
    				LoggedDisplay();
    			} else $('#cm-error-cont').html(e.error);
    		});
    	});

    	$('#cm-register').click(function() {
    		var user = $('#cm-user').val();
    		var pass = $('#cm-pass').val();
    		RegisterDisplay(user, pass);
    	});

    	inlinebtns.appendbtns(displaytype);

    }

    function RegisterDisplay(user, pass) {
    	setDisplayStyle('register');
    	$('#chat-me').find(tabs).remove();

    	$('#chat-me-cont').html('<div style="font-weight:bold; color:white; padding:5px; padding-bottom:10px; background:#8da4a7; margin: 8px -5px;">Sign up</div>')
    	.append('<div id="signup-cont" class="cm-scroll" style="height:calc(100% - 60px);"></div>').find('#signup-cont')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-user class=cm-label>Username:</label><input style="margin-right:10px;" type=text id=cm-user class=cm-input placeholder=Username></div>')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-email class=cm-label>E-mail:</label><input style="margin-right:10px;" type=text id=cm-email class=cm-input placeholder=E-mail></div>')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-pass class=cm-label>Password:</label><input style="margin-right:10px;" type=password id=cm-pass class=cm-input placeholder=Password></div>')
    	.append('<div style="display:flex; align-items:center;"><label for=cm-confirm class=cm-label>Confirm:</label><input style="margin-right:10px;" type=password id=cm-confirm class=cm-input placeholder=Confirm></div>')
    	.append('<div id=cm-error-cont></div>')
    	.append('<div style="position:absolute; bottom:30px; right:10px; width:140px;"><button style="left:0%; height:20px;" id=cm-back class=cm-button>Back</button><button style="right:0%; height:20px;" id=cm-register class=cm-button>Sign up!</button></div>');

    	// $('#chat-me-cont').append('<div class=reg-up width:100%;"></input>  </input></div>');
    	// $('#chat-me-cont').append('<div class=reg-down width:100%;"></input>  </input></div>');

        //        $('#chat-me-cont').append('<label for=cm-pass class=cm-label>Password:</label><input type=password id=cm-pass class=cm-input placeholder=Password></input><br>');

        $('#cm-user').val(user || '');
        $('#cm-pass').val(pass || '');

        $('#cm-back').click(function() {
        	InitDisplay();
        });

        $('#cm-register').click(function() {
        	var user = $('#cm-user').val();
        	var pass = $('#cm-pass').val();
        	var conf = $('#cm-confirm').val();
        	var email = $('#cm-email').val();

        	$('#cm-error-cont').html('');
        	if (!user || !pass || !conf || !email) {
        		$('#cm-error-cont').html("You must fill all the fields in");
        		return;
        	}
        	if (pass != conf) {
        		$('#cm-error-cont').html("Passwords don't match!");
        		return;
        	}

            //$('#cm-error-cont').html(wheel);
            showOptsWait();
            $.post('/signup', {
            	user: user,
            	pass: pass,
            	email: email
            }, function(e) {
            	hideOptsWait();
            	$('#cm-error-cont').removeClass('success').html('');
            	if (e.result == 'success') {
            		$('#cm-error-cont').addClass('success').html(e.message)
            		.append('<br>Redirected in 3 seconds..');
            		setTimeout(InitDisplay, 3000);
            	} else $('#cm-error-cont').html(e.error);
            });
        });

        inlinebtns.appendbtns(displaytype);
    }

    function LoggedDisplay(noslide) {
    	noslide = chatslide ? noslide : true;
    	setDisplayStyle('logged');

    	socket = io();

    	socket.on('connect_error', function() {
    		showModalMessage("There was a problem connecting to the server. Please try again later.", function() {InitDisplay();});
    	});

    	socket.emit('define user', sess_token);

    	socket.on('init', function(data) {

    		sess_user = data.name;
    		var joinedroom =
    		data.joinedroom.startsWith('pm:')?
    		{name: data.joinedroom.split('pm:')[1], type: 'pm'} :
    		{name: data.joinedroom}

    		/* init background */
    		var latestUser = localStorage.latestUser;
    		if (latestUser != sess_user) localStorage.background = '';
    		if (custombg) loadBackground();
    		localStorage.latestUser = sess_user;
    		/* --------------- */
    		var delay = 0;
            Object.keys(data.activerooms).forEach(roomname => { // active tabs
            	var room = data.activerooms[roomname];
            	setTimeout(function() {
            		var newTab = createTab(room);
            		if (room.name == joinedroom.name && room.type == joinedroom.type) switchchat(newTab);
            	}, delay);
            	delay += 50;
            });
            if (joinedroom.name == 'global') switchchat($('.global-tab'));
            else if (joinedroom.name == 'site') switchchat($('.site-tab'));


            pmModal.find('.pm-messages').empty().removeClass('nomsg msgs');
            socket.emit('get pmlist', null, function(err, pmlist) {
            	if (!pmlist.length) pmModal.find('.pm-messages').addClass('nomsg');
            	else pmModal.find('.pm-messages').addClass('msgs');
            	pmlist.forEach(pmrow => {
            		var domRow = $(pmMessage.cloneNode(true));
            		var msgtime = timeSince(pmrow.lastmsg.time);

            		domRow.attr('data-recipient', pmrow.recipientnamefor)
            		.attr('data-unseen', pmrow.unseen);
            		domRow.find('.pm-name').html(pmrow.recipientnamefor);
            		domRow.find('.pm-date').html(msgtime);
            		domRow.find('.pm-msgowner').html(sess_user == pmrow.lastmsg.ownername ? 'You' : pmrow.lastmsg.ownername);
            		domRow.find('.pm-text').append(pmrow.lastmsg.text);

            		if (pmrow.unseen) domRow.addClass('pm-unseen').find('.pm-not').html(pmrow.unseen);
            		domRow.click(function() {
            			socket.emit('switch pmroom', pmrow.recipientnamefor);
            		});

            		pmModal.find('.pm-messages').prepend(domRow);

            	});

            	refreshMsgsNot();
            });
        });
    	socket.on('new message', function(message) {
    		input.focus();
    		switch (message.type) {
    			case 'user_msg':
    			setMessage(message);
    			break;
    			case 'audio':
    			setMessage(message);
    			break;
    			case 'image':
    			setMessage(message);
    			break;
    			case 'system_msg':
    			setSystemMsg(message.text);
    			break;
    		}
    	});
    	socket.on('history_users', function(data) {
    		setUsers(data.users);
    		setHistory(data.history, noslide);
    		showChatNot(data.roomname);
    		noslide = !chatslide;
    		/* recorder */
    		if (recorder.isrecording) socket.emit('recording', true);
    		/* -------- */

    	});
    	socket.on('refresh_user', function(user) {
    		refreshUser(user);
    	});
    	socket.on('add_user', function(user) {
    		refreshUser(user);
    		UserMsgOnOff(user.name, true);
    	});
    	socket.on('remove_user', function(username) {
    		removeUser(username);
    		UserMsgOnOff(username, false);
    	});
    	socket.on('user_typing', function(data) {
    		changeTyping(data);
    	});
    	socket.on('user_recording', function(data) {
    		changeRecording(data);
    	})
    	socket.on('user_color', function(data) {
    		changeColor(data);
    	});
    	socket.on('set room', function(room) {
    		hideOpts();
    		hideOptsWait();
    		hidePmModal();

    		createTab(room);

    		selectchat(room.name);
    	});
    	socket.on('rooms result', function(result) {
    		hideOptsWait();
    		$('.search-body').html('');
    		if (!result.rooms.length) {
    			$('.search-body').append('<center style="color:#444; font-weight:bold; margin-top:25px;"><i>no results found</i></center>');
    			return;
    		}
    		result.rooms.forEach(function(room) {
    			var roomresult = $(roomresultModel.cloneNode(true));
    			var typeclass = room.haspass ? 'pass' : 'free';

    			var htmlquery = '<span class="sel">' + result.query + '</span>';
    			var htmlname = room.name.replace(result.query, htmlquery);

    			roomresult.addClass(typeclass).attr('name', room.name).find('.chat-name').html(htmlname);
    			roomresult.find('.online-num').html(room.users);


    			$('.search-body').append(roomresult);
    		});
    	});
    	socket.on('settings_saved', function() {
    		hideOpts();
    		hideOptsWait();
    	});
    	socket.on('pm-addseen', function(pmMsg) {

    		var time = timeSince(pmMsg.time);

    		var domMsg = pmModal.find('.pm-message[data-recipient=' + pmMsg.recipientnamefor + ']');
            if (domMsg.length) { //msg already exists
            	domMsg.data('unseen', 0).removeClass('pm-unseen').find('.pm-not').empty();
            	domMsg.find('.pm-name').html(pmMsg.recipientnamefor);
            	domMsg.find('.pm-date').html(time);
            	domMsg.find('.pm-text').html('<span class="pm-msgowner">' + pmMsg.ownername + '</span>' + pmMsg.text);
            	domMsg.attr('data-date', pmMsg.time);

            	refreshMsgsNot();

            } else { //create new message

            	domMsg = $(pmMessage.cloneNode(true));

            	domMsg.attr('data-recipient', pmMsg.recipientnamefor)
            	.attr('data-unseen', 0);

            	domMsg.find('.pm-name').html(pmMsg.recipientnamefor);
            	domMsg.find('.pm-date').html(time);
            	domMsg.find('.pm-text').html('<span class="pm-msgowner">' + pmMsg.ownername + '</span>' + pmMsg.text);
            	domMsg.attr('data-date', pmMsg.time);

            	domMsg.click(function() {
            		socket.emit('switch pmroom', pmMsg.recipientnamefor);
            	});

            	pmModal.find('.pm-messages').prepend(domMsg);

            }
        });
    	socket.on('pm-addunseen', function(pmMsg) {

    		console.log(pmMsg);

    		var time = timeSince(pmMsg.time);

    		var domMsg = pmModal.find('.pm-message[data-recipient=' + pmMsg.recipientnamefor + ']');
            if (domMsg.length) { //msg already exists
            	var notnum = (parseInt(domMsg.data('unseen')) || 0) + 1;
            	domMsg.addClass('pm-unseen').data('unseen', notnum).find('.pm-not').html(notnum);
            	domMsg.find('.pm-name').html(pmMsg.recipientnamefor);
            	domMsg.find('.pm-date').html(time);
            	domMsg.find('.pm-text').html('<span class="pm-msgowner">' + pmMsg.ownername + '</span>' + pmMsg.text);
            	domMsg.attr('data-date', pmMsg.time);
            } else { //create new message
            	domMsg = $(pmMessage.cloneNode(true));
            	domMsg.addClass('pm-unseen').attr('data-recipient', pmMsg.recipientnamefor).attr('data-unseen', 1).find('.pm-not').html(1);
            	domMsg.find('.pm-name').html(pmMsg.recipientnamefor);
            	domMsg.find('.pm-date').html(time);
            	domMsg.find('.pm-text').html('<span class="pm-msgowner">' + pmMsg.ownername + '</span>' + pmMsg.text);
            	domMsg.attr('data-date', pmMsg.time);

            	domMsg.click(function() {
            		socket.emit('switch pmroom', pmMsg.recipientnamefor);
            	});

            	pmModal.find('.pm-messages').prepend(domMsg);
            }

            refreshMsgsNot();
            if (!mute) PlayPmNot();

        });
    	socket.on('pm-setseen', function(recipientName) {
    		var domMsg = pmModal.find('.pm-message[data-recipient=' + recipientName + ']');
    		domMsg.data('unseen', 0).removeClass('pm-unseen').find('.pm-not').html(0);

    		refreshMsgsNot();
    	});

    	function refreshMsgsNot() {
    		pmnot = 0;
    		$('.pm-message').each(function() {
    			pmnot += ($(this).data('unseen') || 0);
    		});

    		if (!pmnot) msgnots.hide();
    		else msgnots.show();

    		msgnots.html(pmnot);
    	}

    	socket.on('jsonerror', function(error) {
    		switch (error.type) {
    			case 'stderror':
    			console.log(error.message);
    			showModalMessage(error.message);
    			break;
    			case 'chaterror':
    				console.log(error.message);
    				showChatNot(error.message, 'error');
    			break;
    			case 'invalidtoken':
    			console.log(error.message);
    			InitDisplay();
    			break;
    			case 'roomdoesnotexist':
    			console.log(error.message);
    			showChatNot(error.message, 'error');
    			var tab = $('.chat-tab[name="' + error.data.name + '"][data-type="' + error.data.type + '"]');
    			leaveChat(tab);
    			break;
    			case 'wrongpassword':
    			if ($('#chat-me-options').is(':visible')) {
    				hideOptsWait();
    				$('#type-password-message').html(error.message);
    			} else {
    				var tab = $('.chat-tab[name="' + error.data.name + '"][data-type="' + error.data.type + '"]');
    				leaveChat(tab);
    				showModalMessage("Internal Error. Try to Join the chat again.");
    			}
    			break;
    			case 'nomediafound':
    			var media = $('#' + error.data.id);
    			media.addClass('has-error');
    			break;
    			default:
    			console.log('unhandled error type');
    		}
    	});
    	socket.on('jsonwarning', function(warning) {
    		switch (warning.type) {
    			case 'stdwarn':
    			console.log(warning.message);
    			break;
    			case 'invalidroomname':
    			hideOptsWait();
    			console.log('invalid room name');
    			chatOptions.container.find('#addchat-message').html(warning.message);
    			break;
    			default:
    			console.log('unhandled warning type');
    		}
    	});

    	$('#chat-me').find(tabs).remove();
    	$('#chat-me').prepend(tabs);
    	if (collapsetabs) tabs.children('#chat-me-tabs').addClass('collapse');

    	$('#chat-me-cont').html('');
    	$('#chat-me-cont').append(fullImageCover);
    	$('#chat-me-cont').append(fullImageBtns);
    	$('#chat-me-cont').append(fullImage);
    	$('#chat-me-cont').append('<a id="fullimg-downloader" download style="display:none;"></a>')

    	fullImageBtns.children('.fullimg-close').click(function() {
    		hideFullImg();
    	});

    	fullImageBtns.children('.fullimg-down').click(function() {
    		$('#fullimg-downloader').attr('href', fullImage.attr('data-src'));
    		$('#fullimg-downloader')[0].click();
    	});

    	fullImageCover.click(function(e) {
    		if (e.target != this) return;
    		hideFullImg();
    	});

    	$('#chat-me-cont').append('<div id="chat-me-label"></div>');
    	$('#chat-me-label').append(inlinebtns.container)
    	.append('<div id="cm-display-panel"><div id="cm-display"></div></div>')
    	.find('#cm-display')
    	.append('<div id="cm-online-panel" class="cm-scroll scroll-x"><div id=cm-online> <ul id=cm-online-list></ul> </div></div>')
    	.append('<div id="cm-chat-panel"><div id="cm-chat-not"><span id="cm-not" style="display:none;"></span></div><div id=cm-chat class="cm-scroll"> <div id=cm-chat-list></div> </div> <div id="unseen-icon" onclick="slidebottom()" style="display:none;"></div> </div>')
    	.find('#cm-chat-list').append('<div class="cm-system-msg empty-chat-msg"><hr><div class="system-text">Select a chat</div><hr></div>');
    	$('#chat-me-label')
    	.append('<div id="cm-message-panel"></div>')
    	.find('#cm-message-panel')
    	.append('<div class="message-input-cont"></div>')
    	.find('.message-input-cont')
    	.append('<input maxlength="400" style="margin:0px; width:100%; height:100%; padding-right: 23px;" type=text id=cm-message-input class=cm-input placeholder=Message>')
    	.append('<span class="fa fa-smile-o emojis-btn"></span>')
    	.children('.emojis-btn').append(emojis).click(function(e) {
    		if (this != e.target) return;
    		if ($(this).is('.open')) hideEmojis();
    		else showEmojis();
    	});


    	emojis.find('.emoji-tab').click(function() {
    		var category = $(this).attr('target');
    		emojis.find('.emoji-tab').removeClass('active');
    		$(this).addClass('active');

    		emojis.find('.emoji-category').removeClass('active');
    		emojis.find('.emoji-category.'+category).addClass('active');
    	});

    	emojis.find('.emoji').click(function() {
    		hideEmojis();
    		socket.emit('send message', $(this).data('key'));
    	});

    	$('#cm-display').append('<div id="pending-img" tabindex="0" style="display: none;"> <img style="bottom: -100%;"> <span class="cancel-img"></span> </div>')
    	.find('.cancel-img').click(function() {
    		cancelPendingImg();
    	});

    	$('#cm-display').find('#pending-img').bind('keydown', function(e) {
    		e = e || event;
    		if (e.keyCode == 13 && imgIsPending()) sendImg();
    	})

    	$('#cm-message-panel').append(micbtn);
    	micbtn.prepend(mictime);
    	$('#chat-me-cont').append(messagemodal);
    	$('#chat-me-cont').append(pmModal);
    	msgbtn.click(function() {
    		showPmModal();
    	});
    	pmModal.click(function(e) {
    		if (e.target != this && $(e.target).is(':not(.pm-close)')) return;
    		hidePmModal();
    	});
    	messagemodal.find('.modal-close').click(function() {
    		hideModalMessage();
    		hideOpts();
    		hidePmModal();
    	});


    	input = $('#cm-message-input');

    	input.keydown(function(e) {
            e = e || event;
            if (e.keyCode == 13) postMessage();
        });

    	$('#cm-chat').scroll(function() {
    		$(this).find('.cm-unseen').each(function(i, message) {
    			if (isScrolledIntoView(message)) $(message).removeClass('cm-unseen').addClass('cm-seen');
    		});
    		refreshUnseenIcon();
    	});

    	micbtn.click(startRec);
    	micbtn.find('.recbtn.rec-accept').click(sendRec);
    	micbtn.find('.recbtn.rec-cancel').click(cancelRec);

    	inlinebtns.appendbtns(displaytype);
    }

    window.addEventListener('message', function(event) {
    	if (event.data.type != 'cm-event') return;
    	switch (event.data.key) {
    		case 'client-version':
    		myClientVersion = event.data.value;
    		if (myClientVersion < latestClientVersion) {
    			postParentMessage('update-client', latestClientVersion);
    			showModalMessage("A new client version is available. Close this message or reload the page to update chat.me.", function() {
    				postParentMessage('refresh-page');
    			});
    		}
    		break;
    		case 'show-client-version':
    			showModalMessage("Current version: " + myClientVersion);
    		break;
    		case 'page-state':
    		console.log('page state event!: ' + event.data.value);
    		TriggerConnection(event.data.value);
    		break;
    		case 'selectedsize':
    		selectedsize = event.data.value;
    		$('#chat-me').attr('size', selectedsize);
    		break;
    		default:
    		console.log('unhandled event');
    		console.log(event);
    	}
    });

    function TriggerConnection(status) {
    	if (status == 'cm-blur') {
    		if (socket) socket.disconnect();
    	} else if (status == 'cm-focus') {
    		if (sess_token) LoggedDisplay(true);
    	}
    }

    $(function main() {
    	postParentMessage('successload');
    	selectedtheme = $.cookie('theme') || 'default';
    	$('#chat-me').attr('theme', selectedtheme);

    	/*css*/
    	$('head').append('<style type=text/css>body {margin: 0;} #chat-me {position:relative; overflow:hidden; height:100vh; border-radius:3px;} #chat-me-cont {box-sizing:border-box; padding:5px; padding-top:28px; width:100%; height:100%; background-color:rgba(50,80,100,1.0); font-family:tahoma !important;} #cm-inline-btns {position:absolute; box-sizing:border-box; width:100%; height:15px; z-index: 10;} #cm-message-panel {position: absolute; bottom:0; height:25px; width:100%;} .cm-label {display:inline-block; color:rgb(230,230,230); font-weight:bold; margin:10px; width: 50%; max-width:110px; text-align:right;} .cm-button {position:absolute; overflow:hidden; color:white; text-align:center; width:60px; font-size:10px; background-color:rgb(10,200,50); border:0px; box-shadow:none !important; cursor:pointer; height:100%; border-radius: 2px;} .cm-button:not(.recording):hover {background-color:rgb(20,220,60);} .message-input-cont {position: relative; box-sizing:border-box; width: 100%; height:100%; padding-right:45px; } .emojis-btn {position: absolute; top: 4px; right: 50px;} .emojis-btn:before {cursor: pointer;} .cm-input {box-sizing:border-box; background-color:rgb(240,240,240)!important; border:0px; font-size:12px!important; font-family:\'Montserrat\', sans-serif; width:230px; border:0px; border-radius:2px; padding-left:5px; padding-top:3px; padding-bottom:3px;} #cm-error-cont {color:rgb(220,0,0); font-size:12px; margin-left:8px; margin-top:10px; max-width:200px} #cm-error-cont.success {color: rgb(10,200,50);} #cm-chat {font-family:\'Montserrat\', sans-serif; width:100%; height:100%; background-color:rgb(240,240,240); border-radius:2px;} #cm-chat-list {margin:0; padding:3px 0; font-size:11px;} .cm-message:first-child {margin-top:0 !important}.cm-message:last-child {border:0;} .cm-message {padding: 3px 5px; padding-top:2px;} .cm-message-head {margin-bottom:4px;} .cm-message-body {display: inline-block; max-width:85%; margin: 3px 4%; margin-bottom: 0; border-radius: 5px; background: #d3e4f1; box-shadow: 1px 1px 0px #ddd; padding: 5px 6px;} .cm-clearafter:after {content:\'\'; display:block; clear: both;} .cm-message:hover,.cm-online-name:hover {background-color: rgba(220,220,220,0.4);} .cm-message-name:hover {text-decoration:underline;} .cm-message-name {font-family:\'Montserrat\', sans-serif; font-weight:bold; color:rgb(0,80,0); font-size:9px; cursor: pointer; margin-right: 23px;} .cm-online-name {padding-left:4px; margin-right:0;} .cm-online-name:hover {text-decoration:none;} .cm-message-name:hover .username {text-decoration:underline;} .cm-message-status {font-family:\'Montserrat\', sans-serif; color:grey; font-size: 8px;} .cm-message-text {display:block; margin: 0 4px; max-width:310px; word-wrap:break-word; color:#07324e;} .cm-message-date {float:right; text-align:right; color:grey; font-size:9px; min-width:70px;} #cm-display-panel {box-sizing:border-box; padding-top:20px; padding-bottom:30px; height: 100%; } #cm-display {position: relative; overflow: hidden; display:flex; height: 100%;} #cm-online-panel {margin-right:5px; width:90px;} #cm-online {height:100%; background-color:rgb(240,240,240); border-radius:2px;} #cm-online-list {margin:0; padding:5px 0; font-size:11px;} #cm-record {box-sizing:border-box; display:flex; align-items:center; width: 40px;} .micico {position: absolute; font-size: 165%; top: 0%; right: 15px; padding-top: 5px;}</style>');
    	if (!$('#chat-me-cont').length) return;

    	if (!sess_token) InitDisplay();
    	else LoggedDisplay();
    });

    var chatOptions = {
    	display: {
    		options: {
    			container: '<div class="options-center"><div class="options-block"></div></div>',
    			buttons: [{
    				click: 'userSettingsDis',
    				element: '<div class="option noselect">USER SETTINGS</div>'
    			}, {
    				click: 'displaySettingsDis',
    				element: '<div class="option noselect">WINDOW SETTINGS</div>'
    			}, {
    				click: 'logout',
    				element: '<div class="option noselect">LOGOUT</div>'
    			}]
    		},

    		userSettings: '<div class="settings cm-scroll"><div class="settings-row"> <span class="settings-text">User color:</span><select id="select-color" class="settings-select">' +
    		'<option class="settings-option" value="green">green</option>' +
    		'<option class="settings-option" value="red">red</option>' +
    		'<option class="settings-option" value="blue">blue</option>' +
    		'<option class="settings-option" value="black">black</option>' +
    		'<option class="settings-option" value="yellow">yellow</option>' +
    		'<option class="settings-option" value="orange">orange</option>' +
    		'<option class="settings-option" value="skyblue">skyblue</option>' +
    		'</select></div>' +
    		'<div class="settings-bottom"><button class="cm-button cm-confirm cm-right">Confirm</button><button class="cm-button cm-cancel cm-secondary cm-right">Cancel</button></div>' +
    		'</div>',

    		displaySettings: '<div class="settings cm-scroll"><div class="settings-row"><span class="settings-text">Size:</span><select id="select-size" class="settings-select">' +
    		'<option class="settings-option" value="xs">small</option><option class="settings-option" value="sm">medium</option><option class="settings-option" value="lg">large</option><option class="settings-option" value="res">custom (resizable)</option></select></div>' +
    		'<div class="settings-row"><span class="settings-text">Theme:</span><select id="select-theme" class="settings-select">' +
    		'<option class="settings-option" value="default">default</option><option class="settings-option" value="dark">dark</option><option class="settings-option" value="holo">holo</option></select></div>' +

    		'<div class="settings-row"><span class="settings-text">Custom background:</span><input type="checkbox" id="custom-background" class="settings-input"></div>' +
    		'<div id="custom-background-opts" class="settings-row">' +
			'<div class="settings-row child"><span class="settings-text">Update background:</span><input style="width: 50%;" type="file" accept="image/*" id="background-input"></div>' +
    		'</div>' +

    		'<div class="settings-row"><span class="settings-text">Collapse tabs:</span><input type="checkbox" id="collapse-input" class="settings-input"></div>' +
    		'<div class="settings-row"><span class="settings-text">Slide chat history:</span><input type="checkbox" id="chat-slide-input" class="settings-input"></div>' +
    		'<div class="settings-row"><span class="settings-text">Transparent:</span><input type="checkbox" id="transparent" class="settings-input"></div>' +
    		'<div class="settings-row"><span class="settings-text">Force refresh:</span><button id="refresh-client" class="cm-button" style="float: left; width: 80px; height: 25px; position: relative;">Refresh client</button></div>' +
    		'<div class="settings-bottom"><button class="cm-button cm-cancel cm-secondary cm-right">Back</button></div>' +
    		'</div>',

    		searchchat: '<div class="search-chat cm-scroll"><div id="type-password-mod" style="display:none"><i class="fa fa-remove hidetypepass" onclick="hideTypePass()"></i><div class="type-password-cont"><div id="type-password-text">password for room <div id="type-password-name"></div></div><input id="type-password" type="password" placeholder="password" autofocus="true"><div id="type-password-message"></div></div></div><center class="cm-cont-input search-chat-cont" style="width: 60%;"><input class="cm-opts-input search-chat-input" placeholder="Search chat" autofocus="true"><span class="search-chat-icon"></span></center><hr class="search-div"><div class="search-body"></div></div>',

    		addchat: '<div class="add-chat"> <center> <div class="add-chat-title">Create new chat</div> <div class="cm-cont-input"><input id="addchat-name" class="cm-opts-input" type="text" maxlength="30" placeholder="Chat name"><span class="chat-ico fa-fw"></span></div> <div class="cm-cont-input"><input id="addchat-pass" class="cm-opts-input" maxlength="15" placeholder="Password (empty for free chat)"><span class="pass-ico fa-fw"></span></div> <button class="cm-button addchat-btn">ADD CHAT</button> <div id="addchat-message"></div> </center> </div>',
    	},

    	container: $('#options-content'),
    	spinner: null,

    	initDis: function() {
    		spinner.hide();
    		chatOptions.container.html($(chatOptions.display.options.container));
    		chatOptions.display.options.buttons.forEach(option => {
    			var button = $(option.element);
    			button.mouseup(chatOptions[option.click]);
    			chatOptions.container.find('.options-block').append(button);
    		});
    	},
    	userSettingsDis: function() {
    		spinner.hide();
    		chatOptions.container.html(chatOptions.display.userSettings);
    		var currentcolor = currentusers[sess_user].color;
    		chatOptions.container.find('#select-color option[value='+currentcolor+']').attr('selected', '');
    		chatOptions.container.find('.cm-confirm').click(chatOptions.submitUserSettings);
    		chatOptions.container.find('.cm-cancel').click(chatOptions.initDis);
    	},
    	displaySettingsDis: function() {
    		spinner.hide();
    		chatOptions.container.html(chatOptions.display.displaySettings);
    		var sizeopt = '.settings-option[value=' + selectedsize + ']';
    		var themeopt = '.settings-option[value=' + selectedtheme + ']';
    		chatOptions.container.find('#select-size ' + sizeopt).attr('selected', '');
    		chatOptions.container.find('#select-theme ' + themeopt).attr('selected', '');
    		chatOptions.container.find('#collapse-input').attr('checked', collapsetabs).click( function() {
    			collapsetabs = $(this).is(':checked');
    			$.cookie('collapsetabs', collapsetabs);
    			if (collapsetabs)
    				$('#chat-me-tabs').addClass('collapse');
    			else
    				$('#chat-me-tabs').removeClass('collapse');
    		});
    		chatOptions.container.find('#chat-slide-input').attr('checked', chatslide).click(function() {
    			chatslide = $(this).is(':checked');
    			$.cookie('chatslide', chatslide);
    		});

			var bgopts = chatOptions.container.find('#custom-background-opts').css('display', custombg? 'block' : 'none');
    		chatOptions.container.find('#custom-background').attr('checked', custombg).click(function() {
    			custombg = $(this).is(':checked');
    			$.cookie('custombg', custombg);
    			if (custombg) {
    				bgopts.slideDown('fast');
    				loadBackground();
    			}
    			else {
    				bgopts.slideUp('fast');
    				removeBackground();
    			}
    		});

            chatOptions.container.find('#background-input').change(function() {
                var rawbackground = this.files[0];
                sendBackground(rawbackground);
            });

            chatOptions.container.find('#transparent').attr('checked', transparent).click(function() {
            	transparent = $(this).is(':checked');
            	$.cookie('transparent', transparent);
            	postParentMessage('transparent', transparent);
            });

    		chatOptions.container.find('#refresh-client').click(function() {
    			showOptsWait();
    			postParentMessage('reset-client', latestClientVersion);
    		});

    		chatOptions.container.find('.cm-cancel').click(chatOptions.initDis);
    	},
    	searchChatDis: function() {
    		spinner.hide();
    		chatOptions.container.html(chatOptions.display.searchchat);
    	},
    	addChatDis: function() {
    		spinner.hide();
    		chatOptions.container.html(chatOptions.display.addchat);
    		chatOptions.container.find('.addchat-btn').click(chatOptions.submitChat);
    	},
    	submitChat: function() {
    		chatOptions.container.find('#addchat-message').html('');
    		var chatname = chatOptions.container.find('#addchat-name').val();
    		var chatpass = chatOptions.container.find('#addchat-pass').val();
    		showOptsWait('full');
    		socket.emit('create room', {
    			name: chatname,
    			pass: chatpass
    		});
    	},
    	submitUserSettings: function() {
    		var usersettings = {};
    		var color = chatOptions.container.find('#select-color').val();
    		usersettings.color = color;
    		socket.emit('change_userset', usersettings);
    		showOptsWait('full');
    	},
    	logout: function() {
    		hideOpts();
    		hideOptsWait();
    		InitDisplay();
    	}
    }

    var inlinebtns = {
    	container: $('<div id="cm-inline-btns"></div>'),
    	btns: {
    		minbtn: {
    			element: $('<span class="noselect btn min-btn">_</span>'),
    			display: 'init,logged,register'
    		},
    		optsbtn: {
    			element: $('<span class="noselect btn opts-btn"></span>'),
    			display: 'logged'
    		},
    		fullscreenbtn: {
    			element: $('<span class="noselect btn fullscreeen-btn"></span>'),
    			display: 'init,logged,register'
    		},
    		statusbtn: {
    			element: $('<span class="noselect btn status-btn modal-toggle"><div class="modal status-modal"><div class="modal-body"></div></div></span>'),
    			display: 'logged'
    		},
    		searchbtn: {
    			element: $('<span class="noselect btn search-btn"></span>'),
    			display: 'logged'
    		},
    		addbtn: {
    			element: $('<span class="noselect btn add-btn"></span>'),
    			display: 'logged'
    		},
    		attachbtn: {
    			element: $('<span class="noselect btn attach-btn"><label id="attach-label" for="cm-attach"></label></span>'),
    			display: 'logged'
    		},
    		mutebtn: {
    			element: $('<span class="noselect btn mute-btn mute-false"></span>'),
    			display: 'logged'
    		},
    		showusersbtn: {
    			element: $('<span class="noselect btn show-users-btn users-true"></span>'),
    			display: 'logged'
    		},
    	},
    	data: {
    		statusmodal: [{
    			name: 'Online',
    			value: 'online'
    		}, {
    			name: 'Offline',
    			value: 'offline'
    		}, {
    			name: 'Busy',
    			value: 'busy'
    		}, {
    			name: 'Away from keyboard',
    			value: 'afk'
    		}, {
    			name: 'At the toilet',
    			value: 'toilet'
    		}]
    	},
    	initbtns: function() {

    		var buttons = this.btns;

    		/* showusersbtn */
    		var switchUsersBtn = function() {
    			buttons.showusersbtn.object.removeClass('users-' + !showusers).addClass('users-' + showusers);
    		}
    		buttons.showusersbtn.object = $(buttons.showusersbtn.element[0].cloneNode(true));

    		showusers = $.cookie('userstab') == 'true';
    		switchUsersBtn();
    		if (!showusers) $('#cm-online-panel').css('display', 'none');

    		buttons.showusersbtn.object.click(function() {
    			showusers = !showusers;
    			$.cookie('userstab', showusers);
    			switchUsersBtn();
    			toggleUsers(showusers);
    		});
    		/* mutebtn */
    		var switchMuteBtn = function() {
    			buttons.mutebtn.object.removeClass('mute-' + !mute).addClass('mute-' + mute);
    		}
    		buttons.mutebtn.object = $(buttons.mutebtn.element[0].cloneNode(true));

    		mute = $.cookie('mute') == 'true';
    		switchMuteBtn();

    		buttons.mutebtn.object.click(function() {
    			mute = !mute;
    			$.cookie('mute', mute);
    			switchMuteBtn();
    		});
    		/* searchbtn */
    		buttons.searchbtn.object = $(buttons.searchbtn.element[0].cloneNode(true));
    		buttons.searchbtn.object.click(function() {
    			showOpts();
    			chatOptions.searchChatDis();
    		});
    		/* addchbtn */
    		buttons.attachbtn.object = $(buttons.attachbtn.element[0].cloneNode(true));
    		buttons.attachbtn.object.find('#attach-label').append(attachinput);

    		/* addchbtn */
    		buttons.addbtn.object = $(buttons.addbtn.element[0].cloneNode(true));
    		buttons.addbtn.object.click(function() {
    			showOpts();
    			chatOptions.addChatDis();
    		});
    		/* optsbtn */
    		buttons.optsbtn.object = $(buttons.optsbtn.element[0].cloneNode(true));
    		buttons.optsbtn.object.click(function() {
    			showOpts();
    			chatOptions.initDis();
    		});
    		/* minbtn */
    		buttons.minbtn.object = $(buttons.minbtn.element[0].cloneNode(true));
    		buttons.minbtn.object.click(function() {
    			postParentMessage('minify');
    		});
    		/* minbtn */
    		buttons.fullscreenbtn.object = $(buttons.fullscreenbtn.element[0].cloneNode(true));
    		buttons.fullscreenbtn.object.click(function() {
    			postParentMessage('togglefs');
    		});
    		/* status btn */
    		buttons.statusbtn.object = $(buttons.statusbtn.element[0].cloneNode(true));
    		buttons.statusbtn.object.click(function(e) {
    			$(this).find('.status-modal').toggle();
    		});
    		inlinebtns.data.statusmodal.forEach(function(status) {
    			var statusrow = $('<div class="status-row" data-val="' + status.value + '">' + status.name + '</div>');
    			statusrow.click(function() {
    				socket.emit('change_status', $(this).data('val'));
    			});
    			buttons.statusbtn.object.find('.modal-body').append(statusrow);
    		});
    		/* ========= */

    	},
    	appendbtns: function(type) {
    		this.initbtns();
    		var buttons = this.btns;
    		inlinebtns.container.empty();

    		for (var btnname in buttons) {
    			var button = buttons[btnname];
    			if (!button.display.match(type))
    				continue;
    			inlinebtns.container.append(button.object);
    		}
    	}
    };

})();

function sendBackground(data) {
	showOptsWait();
	try {
	    var bufferReader = new FileReader();

	    bufferReader.onload = function() {
	        socket.emit('set background', this.result, saveBackground);
	    };
	    bufferReader.readAsArrayBuffer(data);
	} catch(e) {
		hideOptsWait();
		showModalMessage("Internal error. Try again later");
	}
};

function setBackground(dataurl, closeopts) {
	try {
		fetch(dataurl)
		.then(res => res.blob())
		.then(blob => {
	    	var bufferurl = window.URL.createObjectURL(blob);
	    	var tmpImg = new Image();
	    	tmpImg.src = bufferurl;
	    	tmpImg.onload = function() {
		    	$('#cm-chat').addClass('bg').css('background-image', 'url('+bufferurl+')');
		    	hideOptsWait();
		    	if (closeopts) hideOpts();
	    	}
		});
	} catch(e) {
		hideOptsWait();
		console.log(e);
	}
}

function saveBackground(buffer) {
	console.log(buffer);
	var bufferReader = new FileReader();
	bufferReader.onload = function() {
		localStorage.background = this.result;
		setBackground(this.result, true);
	};
	bufferReader.readAsDataURL(
		new Blob([buffer], {
			'type': 'image/jpeg'
		})
	);
}

function removeBackground() {
	$('#cm-chat').removeClass('bg').css('background-image', '');
}

function loadBackground() {
	if (localStorage.background) setBackground(localStorage.background);
	else loadFromServer();
}

function loadFromServer() {
	showOptsWait('light');
	socket.emit('get background', saveBackground);
}

function createTab(room) {
	chats[room.name] = {
		volume: true
	};

	$('.chat-tab[name="' + room.name + '"]').remove();
	var type = room.type ? room.type : 'custom';
	var newTab = $('<div class="chat-tab custom noselect" data-type="' + type + '" name="' + room.name + '" pass="' + room.pass + '"><span class="volume-icon vol-true"></span><div class="tab-text">' + room.html + '</div><i class="fa fa-times remove-tab"></i></div>');

	if (type == 'pm') {
		newTab.addClass('pm');
	} else {
		newTab.addClass(room.pass ? 'pass' : 'free');
	}
	tabs.children('#chat-me-tabs').append(newTab);
	return newTab;
}

function switchchat(tab) {
	tab = $(tab);
	roomtype = tab.data('type');
	roomname = roomtype == 'site' ? site : tab.attr('name');
	roompass = tab.attr('pass');

	var room = {
		type: roomtype,
		name: roomname,
		pass: roompass
	}
	selectchat(tab);
	socket.emit('switch room', room);
}

function selectchat(chat) {
	tabs.find('.chat-tab').removeClass('sel');
	if (typeof chat == 'string') {
		tabs.find('.chat-tab[name="' + chat + '"]').addClass('sel');
	} else if (typeof chat == 'object') {
		tabs.find(chat).addClass('sel');
	}
}

function removeTab(el) {
	leaveChat($(el).parent());
}

function leaveChat(tab) {
	if (tab.is('.sel')) {
		prevTab = tab.prev();
		switchchat(prevTab);
	}
	socket.emit('remove active room', tab.attr('name'));
	tab.remove();
    // here to leave the socket b-e active room will be implemented
}

function checkTyping() {
	var typing = !!$('#cm-message-input').val();
	if (prevtyping != typing) {
		prevtyping = typing;
		socket.emit('typingstatus', typing);
	}
}

function switchvolume(tab) {
	var chatname = $(tab).attr('name');
	var volume = chats[chatname].volume;
	chats[chatname].volume = !volume;
	$(tab).find('.volume-icon').removeClass('vol-' + volume).addClass('vol-' + !volume);
}

function toggleUsers(show) {
	var action = show ? 'show' : 'hide';
	$('#cm-online-panel').animate({
		width: action
	}, {
		duration: 'fast'
	});
}

function slidebottom(callback) {
	callback = callback || function() {};
	$("#cm-chat").stop().animate({
		scrollTop: $("#cm-chat-list").height()
	}, "slow", callback);
}

$('#chat-me').click(function(e) {
	if ($(e.target).is(':not(.modal,.modal-toggle)')) $('.modal').hide();
});

$(document).on('click', '.chat-tab', function(e) {
	if ($(e.target).is('.remove-tab')) removeTab(e.target);
	else if ($(e.target).is('.volume-icon')) switchvolume(this);
	else if ($(this).is(':not(.sel)')) switchchat(this);
}).on('mousedown', '.chat-tab', function(e) {
	if( e.which == 2 && $(this).is(':not(.base)')) { //mouse wheel press
		leaveChat($(this));
	}
});

function showEmojis() {
	$('.emojis-btn').addClass('open');
	emojis.slideDown('fast');
}

function hideEmojis() {
	$('.emojis-btn').removeClass('open');
	emojis.slideUp('fast');
}

function showOpts() {
	options.fadeIn(60);
}

function hideOpts() {
	options.fadeOut(60);
}

function showPmModal() {
	var pmMessages = pmModal.find('.pm-messages');
	pmModal.fadeIn(100);
}

function hidePmModal() {
	pmModal.fadeOut(40, function() {
		clearPmSearch($('.pm-btn'));
	});
}

function expandPmBtn(buttons) {
	$(buttons).each(function() {
		if ($(this).is('.pm-show')) return;
		$(this).addClass('pm-show').stop().animate({
			'padding-right': '6px'
		}, 'fast')
		.css('border-bottom', '1px solid skyblue')
		.find('input').stop().animate({
			padding: '6px',
			width: 'show'
		}, 'fast')
		.focus();
	})
}

function collapsePmBtn(buttons) {
	$(buttons).each(function() {
		if ($(this).is(':not(.pm-show)')) return;
		$(this).removeClass('pm-show').stop().animate({
			'padding-right': '2px'
		}, 'fast', function() {
			$(this).css('border', '');
		})
		.find('input').stop().animate({
			padding: '0px',
			width: 'hide'
		}, 'fast', function() {
			$(this).removeClass('pm-show').val('');
		})
	});
}

function deleteMsgsFilter() {
	$('.pm-messages .pm-message').show();
	$('.pm-messages').removeClass('nomsg msgs');
	if (!$('.pm-messages .pm-message').length) {
		$('.pm-messages').addClass('nomsg');
	} else $('.pm-messages').addClass('msgs');

}

function clearPmSearch(pmbtn) {
	if (pmbtn) collapsePmBtn(pmbtn);
	$('.pm-results-cont').slideUp('fast');
	deleteMsgsFilter();
}

$(document).on('keyup', '.pm-add-input', function() {
	var query = $(this).val();
	$('.pm-results-cont').slideDown('fast');
	if (query.length < 3) return $('.search-results').removeClass('nomatches').addClass('tooshort').empty();

	socket.emit('search users', query, function(err, userslist) {
		if (err || !userslist) return console.log(err);
		$('.search-results').removeClass('nomatches tooshort').empty();

		if (!userslist.length) $('.search-results').addClass('nomatches');

		var htmlmatch = '<span class="sel">' + query + '</span>';

		userslist.forEach(listname => {
			var htmlListName = listname.replace(query, htmlmatch);
			var userResult = $('<div class="pm-user-result">' + htmlListName + '</div>');
			userResult.click(function() {
				socket.emit('switch pmroom', listname);
			});

			$('.search-results').append(userResult);
		});
	});
});

$(document).on('keyup', '.pm-search-input', function() {
	var query = $(this).val();

	if (!query) return deleteMsgsFilter();

	$('.pm-messages').removeClass('nomsg msgs')
	.find('.pm-message').each(function() {
		var msgRecipient = $(this).data('recipient');
		if (msgRecipient.match(query)) {
			$(this).show();
		} else {
			$(this).hide();
		}
	});
	if (!$('.pm-messages .pm-message:visible').length) {
		$('.pm-messages').addClass('nomsg');
	} else $('.pm-messages').addClass('msgs');
});

$(document).on('click', '.pm-btn', function(e) {
	if ($(this).is(':not(.pm-show)')) clearPmSearch();
	if ($(e.target).is('.pm-clear-search')) return clearPmSearch(this);

	if (e.target != this) return;

	collapsePmBtn($('.pm-btn'));
	expandPmBtn(this);
});

$(document).on('mouseenter', '.option', function() {
	$(this).css({
		'background-color': 'rgb(150, 165, 171)',
		'color': 'navajowhite'
	});
	$(this).animate({
		'font-size': '13px'
	}, {
		queue: false,
		duration: 50
	});
}).on('mouseleave', '.option', function() {
	$(this).css({
		'background-color': '',
		'color': ''
	});
	$(this).animate({
		'font-size': '11px'
	}, {
		queue: false,
		duration: 50
	});
});
$(document).on('keyup', '.search-chat-input', function() {
	var roomname = $(this).val();
	$('.search-body').empty();
	if (roomname.length >= 3) {
		showOptsWait('light');
		socket.emit('search rooms', roomname);
	} else {
		$('.search-body').empty();
	}
});

$(document).on('click', '.cm-message-name:not(.user-You)', function() {
	var username = $(this).data('name');
	if (username == sess_user) return;
	console.log(username);
	socket.emit('switch pmroom', username);
})

function showOptsWait(typeclass = 'full') { //typeclass can be 'full' or 'light'
spinner.removeClass('full light').addClass(typeclass).show();
}

function hideOptsWait() {
	spinner.hide();
}

function showTypePass(roomname) {
	$('#type-password-name').html(roomname);
	$('#type-password-mod').attr('name', roomname).show();
}

function hideTypePass() {
	$('#type-password-message').empty();
	$('#type-password-mod').hide();
}

function joinPassRoom() {
	$('#type-password-message').empty();
	var roomname = $('#type-password-mod').attr('name');
	var roompass = $('#type-password').val();
	var room = {
		name: roomname,
		pass: roompass
	};
	socket.emit('join room', room);
}

function postParentMessage(key, value) {
	parent.postMessage({
		key: key,
		value: value,
		type: 'cm-event'
	}, '*');
}

function showModalMessage(message, closecallback) {
	$('.cm-message-modal').show()
	.find('.message-modal-body').html(message);

	onmodalclose = closecallback;
}

function hideModalMessage() {
	$('.cm-message-modal').hide();
	if (onmodalclose) {
		onmodalclose();
		onmodalclose = undefined;
	}
}

function convertDate(inputFormat) {
	function pad(s) { return (s < 10) ? '0' + s : s; }
	var d = new Date(inputFormat);
	return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/');
}

var timeSince = function(date) {
	if (typeof date !== 'object') {
		date = new Date(date);
	}

	var seconds = Math.floor((new Date() - date) / 1000);
	var intervalType;

	var interval = Math.floor(seconds / 31536000);
	if (interval >= 1) {
		intervalType = 'year';
		return convertDate(date);
	} else {
		interval = Math.floor(seconds / 2592000);
		if (interval >= 1) {
			intervalType = 'month';
			return convertDate(date);
		} else {
			interval = Math.floor(seconds / 86400);
			if (interval >= 3)
				return convertDate(date);

			if (interval == 1)
				return 'yesterday';

			if (interval >= 1) {
				intervalType = 'day';
			} else {
				interval = Math.floor(seconds / 3600);
				if (interval >= 1) {
					intervalType = 'hour';
				} else {
					interval = Math.floor(seconds / 60);
					if (interval >= 1) {
						intervalType = 'minute';
					} else {
						interval = seconds;
						intervalType = 'second';

						if (interval <= 4) return 'now';
					}
				}
			}
		}
	}

	if (interval > 1 || interval === 0) {
		intervalType += 's';
	}

	return interval + ' ' + intervalType + ' ago';
};

$(document).on('click', '.chat-row', function() {
	roomname = $(this).attr('name');
	var room = {
		name: roomname
	};
	if ($(this).is('.free')) {
		socket.emit('join room', room);
	} else {
		showTypePass(roomname);
	}
}).on('keydown', '#type-password', function(e) {
    e = e || event;
    if (e.keyCode == 13) joinPassRoom();
});

$(document).on('change', '#select-size', function() {
	postParentMessage('windowsize', $(this).val());
});

$(document).on('change', '#select-theme', function() {
	$('#chat-me').attr('theme', $(this).val());
	selectedtheme = $(this).val();
	$.cookie('theme', selectedtheme);
});

$(document).on('keyup', '#cm-message-input', checkTyping);

$(document).on('keydown', function(e) {
	if (e.keyCode === 27) {
		hideOpts();
		cancelPendingImg();
		hidePmModal();
		hideFullImg();
		hideModalMessage();
	}
});

$(document).mouseleave(function() {
	if (fullImage.is(':visible'))
		fullImageBtns.stop(true, true).fadeOut();
}).mouseenter(function() {
	if (fullImage.is(':visible'))
		fullImageBtns.stop(true, true).fadeIn(100);
});

setInterval(function() {
	var updateDate = function() {
		$(this).find('.update-date').html(timeSince($(this).data('date')));
	};
	$('#cm-chat-list').children('.cm-message').each(updateDate);
	$('.pm-messages').children('.pm-message').each(updateDate);
}, 30000);

!function trigger() {
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', 'UA-105840630-1', 'auto');
  ga('send', 'pageview', site);
}();