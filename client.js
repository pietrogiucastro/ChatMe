// ==UserScript==
// @name         chat.me client
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Description
// @author       pietrogiucastro@alice.it
// @match        http://stackoverflow.com/
// @match        https://*
// @match        http://*
// @match        https://*/*
// @match        http://*/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==
var settings_page = 'chat.me';
var server = '68.66.241.102';
server = 'localhost';
var version = '001';

var connection;
var sess_token = GM_getValue('sess_token');
var sess_user = GM_getValue('sess_user');
var wheel   = document.createElement('img');
wheel.id    = 'cm-wheel';
//wheel.src   = 'http://campaign.childfund.or.kr/resources/images/common/icon_loading.gif';
wheel.style = 'width:40px;';

var input;


// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show
// some notification and exit
if (!window.WebSocket) {
    content.html($('<p>', { text:'Sorry, but your browser doesn\'t support WebSocket.'}));
    //handle disable code
    return;
}


(function() {
    'use strict';

    if (document.domain == settings_page) return document.write('chat me settings. Under construction..');
    if (document.domain == server) return;

    function setMessage(msg) {
        var rescroll = false;
        var RANGE = 30; //px
        if ($('#cm-chat')[0].scrollTop >= $('#cm-chat')[0].scrollHeight - $('#cm-chat').height() - RANGE) rescroll = true;

        var message   = document.createElement('li');
        message.class = 'cm-message';
        var user_message = sess_user == msg.author? 'You' : msg.author;
        var time = new Date(msg.time).toLocaleString().split(', ')[1].slice(0, -3);
        $(message).html('<span class=cm-message-name>'+user_message+'</span><span class=cm-message-date>'+time+'</span><span class=cm-message-text>'+msg.text+'</span>');
        $('#cm-chat-list').append('<hr style=margin:0px 3px 0px 3px>');
        $('#cm-chat-list').append(message);

        if(rescroll) $('#cm-chat')[0].scrollTop = $('#cm-chat')[0].scrollHeight - $('#cm-chat').height();

    }

    function setHistory(msgs) {
        $('#chat-me-cont #spinner').remove();

        var rescroll = false;
        var RANGE = 30; //px
        if ($('#cm-chat')[0].scrollTop >= $('#cm-chat')[0].scrollHeight - $('#cm-chat').height() - RANGE) rescroll = true;
        $('#cm-chat-list').html('');

        msgs.forEach(function(msg) {
            var message   = document.createElement('li');
            message.class = 'cm-message';
            var user_message = sess_user == msg.author? 'You' : msg.author;
            var time = new Date(msg.time).toLocaleString().split(', ')[1].slice(0, -3);
            $(message).html('<span class=cm-message-name>'+user_message+'</span><span class=cm-message-date>'+time+'</span><span class=cm-message-text>'+msg.text+'</span>');
            $('#cm-chat-list').append('<hr style=margin:0px 3px 0px 3px>');
            $('#cm-chat-list').append(message);
        });

        if(rescroll) $('#cm-chat')[0].scrollTop = $('#cm-chat')[0].scrollHeight - $('#cm-chat').height();

        /*
        $('#cm-online-list').html('');
        e.online.forEach(function(usr){
            $('#cm-online-list').append('<li class=cm-message-name>'+usr+'</li>');
        });
        */

    }


    function postMessage() {
        var msg = input.val();
        if (!msg) return;
        if (msg == 'quit') {
            InitDisplay();
            return;
        }
        connection.send(msg);
        input.val('').attr('disabled', 'disabled');

        /*
        var button = $('#cm-send');
        button.html(wheel);
        var text = $('#cm-message-input').val();
        $('#cm-message-input').val('');
        if (text == 'quit') {
            InitDisplay();
            return;
        }
        $.get('https://script.google.com/macros/s/AKfycbzTaPP2QXWeGOmdUadGk-nCYtvxXi3ZfY0uPRHqlokFaqUO9-Y/exec', {
            action : 'post',
            token  : sess_token,
            text   : text
        }, function(e) {
            button.html('Send');
            $('#cm-chat')[0].scrollTop = $('#cm-chat')[0].scrollHeight - $('#cm-chat').height();
            console.log(e);
        });
        */
    }
    function InitDisplay() {
        sess_token = ''; sess_user = '';
        GM_setValue('sess_user', sess_user); GM_setValue('sess_token', sess_token);
        $('#chat-me-cont').html('');
        $('#chat-me-cont').append('<label for=cm-user class=cm-label>Username:</label><input type=text id=cm-user class=cm-input placeholder=Username></input><br>');
        $('#chat-me-cont').append('<label for=cm-pass class=cm-label>Password:</label><input type=password id=cm-pass class=cm-input placeholder=Password></input><br>');
        $('#chat-me-cont').append('<div id=cm-error-cont></div>');
        $('#chat-me-cont').append('<div style="position:absolute; bottom:28%; right:6%; width:140px;"><button style=left:0%; id=cm-login class=cm-button>Login</button><button style=right:0% id=cm-register class=cm-button>Register</button></div>');

        $('#cm-login').click(function(){
            $('#cm-error-cont').html(wheel);
            var user = $('#cm-user').val();
            var pass = $('#cm-pass').val();
            $.get('https://script.google.com/macros/s/AKfycbzTaPP2QXWeGOmdUadGk-nCYtvxXi3ZfY0uPRHqlokFaqUO9-Y/exec', {
                action : 'login',
                user  : user,
                pass  : pass
            }, function(e) {
                $('#cm-error-cont').html('');
                console.log(e);
                if (e.result == 'success') {
                    sess_user = e.user;
                    sess_token = e.token;
                    GM_setValue('sess_user', sess_user);
                    GM_setValue('sess_token', sess_token);
                    LoggedDisplay();
                }
                else $('#cm-error-cont').html(e.error);
            });
        });

        $('#cm-register').click(function(){
            var user = $('#cm-user').val();
            var pass = $('#cm-pass').val();
            RegisterDisplay(user, pass);
        });

    }
    function RegisterDisplay(user, pass) {
        $('#chat-me-cont').html('<div style="font-weight:bold; color:white; margin-bottom:-8px">Register</div><br>');
        $('#chat-me-cont').append('<div class=reg-up width:100%;"><label for=cm-user class=cm-label>Username:</label><input style="width:20%;" type=text id=cm-user class=cm-input placeholder=Username></input>  <label style="width:50px;" for=cm-email class=cm-label>E-mail:</label><input style="width:25%;" type=text id=cm-email class=cm-input placeholder=E-mail></input></div>');
        $('#chat-me-cont').append('<div class=reg-down width:100%;"><label for=cm-pass class=cm-label>Password:</label><input style="width:20%;" type=password id=cm-pass class=cm-input placeholder=Password></input>  <label style="width:50px;" for=cm-confirm class=cm-label>Confirm:</label><input style="width:25%;" type=password id=cm-confirm class=cm-input placeholder=Confirm></input></div>');
        $('#chat-me-cont').append('<div id=cm-error-cont></div>');
        $('#chat-me-cont').append('<div style="position:absolute; bottom:28%; right:6%; width:140px;"><button style=left:0%; id=cm-back class=cm-button>Back</button><button style=right:0% id=cm-register class=cm-button>Register</button></div>');

        //        $('#chat-me-cont').append('<label for=cm-pass class=cm-label>Password:</label><input type=password id=cm-pass class=cm-input placeholder=Password></input><br>');

        $('#cm-user').val(user || '');
        $('#cm-pass').val(pass || '');

        $('#cm-back').click(function() {
            InitDisplay();
        });

        $('#cm-register').click(function() {
            var user  = $('#cm-user').val();
            var pass  = $('#cm-pass').val();
            var conf  = $('#cm-confirm').val();
            var email = $('#cm-email').val();

            $('#cm-error-cont').html('');
            if (!user || !pass || !conf || !email) {$('#cm-error-cont').html("You must fill all the fields in"); return;}
            if (pass != conf) {$('#cm-error-cont').html("Passwords don't match!"); return;}

            $('#cm-error-cont').html(wheel);

            $.get('https://script.google.com/macros/s/AKfycbzTaPP2QXWeGOmdUadGk-nCYtvxXi3ZfY0uPRHqlokFaqUO9-Y/exec', {
                action : 'register',
                user  : user,
                pass  : pass,
                email : email
            }, function(e) {
                $('#cm-error-cont').html('');
                console.log(e);
                if (e.result == 'success') $('#cm-error-cont').html(e.content);
                else $('#cm-error-cont').html(e.error);
            });
        });
        /*     $.get('https://script.google.com/macros/s/AKfycbzTaPP2QXWeGOmdUadGk-nCYtvxXi3ZfY0uPRHqlokFaqUO9-Y/exec', {
            action : 'register',
            user  : user,
            pass  : pass
        }, function(e) {
            $('#cm-error-cont').html('');
            console.log(e);
            if (e.result == 'success') LoggedDisplay(e.user, e.token);
            else $('#cm-error-cont').html(e.error);
        });    */
    }
    function LoggedDisplay() {

        connection = new WebSocket('ws://'+server+':1337/'+sess_user);
        connection.onopen = function () {
            input.removeAttr('disabled');
        };
        connection.onerror = function (error) {
            // just in there were some problems with connection...
            content.html($('<p>', {
                text: 'Sorry, but there\'s some problem with your '
                + 'connection or the server is down.'
            }));
        };
        connection.onmessage = function (message) {
            // try to parse JSON message. Because we know that the server
            // always returns JSON this should work without any problem but
            // we should make sure that the massage is not chunked or
            // otherwise damaged.
            var json;
            try {
                json = JSON.parse(message.data);
            } catch (e) {
                console.log('Invalid JSON: ', message.data);
                return;
            }
            // NOTE: if you're not sure about the JSON structure
            // check the server source code above
            // first response from the server with user's color
            if (json.type === 'history') { // entire message history
                setHistory(json.data);
            } else if (json.type === 'message') { // it's a single message
                input.removeAttr('disabled');
                setMessage(json.data);
            } else {
                console.log('Hmm..., I\'ve never seen JSON like this:', json);
            }
        };


        var bigwheel = document.createElement('img');
        //bigwheel.src = 'http://campaign.childfund.or.kr/resources/images/common/icon_loading.gif';
        bigwheel.id = 'spinner';
        bigwheel.style.width='50px';
        bigwheel.style.position='absolute';
        bigwheel.style.top='29%';
        bigwheel.style.left='45%';

        wheel.style.width='30px';
        wheel.style['margin-top']='-9px';

        $('#chat-me-cont').html('');
        $('#chat-me-cont').append('<div id=cm-online> <ul id=cm-online-list></ul> </div>');
        $('#chat-me-cont').append('<div id=cm-chat> <ul id=cm-chat-list></ul> </div>');
        $('#chat-me-cont').append('<div style="position:absolute; bottom:7px;"><input style="margin:0px; width:282px; padding:8px 10px;" type=text id=cm-message-input class=cm-input placeholder=Message></input><button style="margin-left:11px; height:27px;" id=cm-send class=cm-button>Send</button></div>');

        $('#cm-chat-list').html(bigwheel);

        input = $('#cm-message-input');

        input.keydown(function(e) {
            e = e || event; // to deal with IE
            if (e.keyCode == 13) postMessage();
        });

        $('#cm-send').click(postMessage);
    }
    !function main() {
        /*css*/ $('head').append('<style type=text/css>#chat-me-cont {position:fixed; z-index:99999999999999999999; box-sizing:border-box; padding:11px; bottom:20px; right:20px; width:404px; height:174px; background-color:rgba(50,80,100,1.0); border:1px solid rgb(100,130,100); border-radius:3px; font-family:tahoma !important;} .cm-label {display:inline-block; color:rgb(230,230,230); font-weight:bold; margin:10px; width:65px;} .cm-button {position:absolute; width:65px; font-size:10px; background-color:rgb(10,200,50); border:0px; box-shadow:none !important;} .cm-input {background-color:rgb(240,240,240)!important; border:0px; font-size:12px!important; width:230px; height:9px; border:0px; border-radius:2px;} #cm-error-cont {color:rgb(220,0,0); font-size:12px; margin-left:8px; margin-top:10px; max-width:200px} #cm-chat {width:81%; height:80%; background-color:rgb(240,240,240); border-radius:2px; overflow-y:scroll; float:right;} #cm-chat-list {margin:0; padding:5px; font-size:11px;} .cm-message-name {font-weight:bold; margin-right:10px; color:rgb(0,130,0);} .cm-message-text {display:block; margin-right:10px; max-width:310px; word-wrap:break-word; color:rgb(30,30,30)} .cm-message-date {float:right; color:grey;} #cm-online {width:60px; height:80%; float:left; margin-left:1px; background-color:rgb(240,240,240); overflow-y:scroll; border-radius:2px;} #cm-online-list {margin:0; padding:5px; font-size:11px;}</style>');
        //  /*el*/  $('body').append('<div id=chat-me-cont></div>');
        /*$.get('https://'+server+':60000/client/'+version, function(res) {
            $('body').append(res);
            if (!$('#chat-me-cont').length) return;
            if (!sess_token || !sess_user)
                InitDisplay();
            else LoggedDisplay();
        });*/
        $('head').append('<style type=text/css> #chat-me-frame { position:fixed; z-index:99999999999999999999; bottom:20px; right:20px; width:404px; height:198px; border:0;} </style>');
        $('body').append('<iframe id="chat-me-frame" src="https://'+server+':60000/"></iframe>');
    }();

})();