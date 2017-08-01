var settings_page = 'chat.me';
var server = document.domain;
var version = '001';

var site = (window.location != window.parent.location) ? document.referrer : document.location.href;
function url_domain(data) {
  var a = document.createElement('a');
  a.href = data;
  return a.hostname;
}

site = 'site://' + url_domain(site);

var displaytype;
var socket;
var sess_token = $.cookie('sess_token');
var sess_user = $.cookie('sess_user');
var wheel   = document.createElement('img');
wheel.id    = 'cm-wheel';
wheel.src   = 'https://media.tenor.com/images/85d269dc9595a7bcf87fd0fa4039dd9f/tenor.gif';
wheel.style = 'width:40px;';

var prevtyping = false;
var input;
var not1 = new Audio('/sounds/not1.mp3');

var chats = {global: {volume: true}, site: {volume: true}};
var currentchat;

var tabs = $('<div id="chat-me-tabs"><div class="chat-tab global-tab sel" data-name="global" data-type="global"><span class="volume-icon vol-true"></span>Global</div><div class="chat-tab site-tab" data-name="site" data-type="site"><span class="volume-icon vol-true"></span>Site</div></div>');
var roomresultModel = $('<div class="chat-row"><span class="chat-name"></span> <span class="chat-online"><i class="fa fa-user" style="margin-right:4px;"></i><span class="online-num"></span></span></div>')[0];
// if user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;
// if browser doesn't support WebSocket, just show
// some notification and exit


(function() {
    'use strict';

    if (document.domain == settings_page) document.write('chat me settings. Under construction..');

    if (!window.WebSocket) {
        content.html($('<p>', { text:'Sorry, but your browser doesn\'t support WebSocket.'}));
        //handle disable code
        return;
    }

    function setDisplayStyle(type) {
        displaytype = type;
        $('#chat-me').removeClass().addClass(type);
    }

    function setMessage(msg) {
        var rescroll = false;
        var RANGE = 30; //px
        if ($('#cm-chat')[0].scrollTop >= $('#cm-chat')[0].scrollHeight - $('#cm-chat').height() - RANGE) rescroll = true;

        var message   = document.createElement('div');
        message.className = 'cm-message';
        var user_message = sess_user == msg.author? 'You' : msg.author;
        var time = new Date(msg.time).toLocaleString().split(', ')[1].slice(0, -3);
        $(message).html('<span class=cm-message-name>'+user_message+'</span><span class=cm-message-date>'+time+'</span><span class=cm-message-text>'+msg.text+'</span>');
        //$('#cm-chat-list').append('<hr style=margin:0px 3px 0px 3px>');
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
            var message   = document.createElement('div');
            message.className = 'cm-message';
            var user_message = sess_user == msg.author? 'You' : msg.author;
            var time = new Date(msg.time).toLocaleString().split(', ')[1].slice(0, -3);
            $(message).html('<span class=cm-message-name>'+user_message+'</span><span class=cm-message-date>'+time+'</span><span class=cm-message-text>'+msg.text+'</span>');
            //$('#cm-chat-list').append('<hr style=margin:0px 3px 0px 3px>');
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

    function notifsound() {
        not1.currentTime=0;
        not1.play();
    }

    function setUsers(users) {
        $('#cm-online-list').empty();
        for (var username in users) {
             var user = users[username];
             appendUser(user);
        }
    }
    function appendUser(user) {
        var status = user.status;
        var typingclass = user.istyping ? ' typing' : '';
        status.classname += typingclass;
        $('#cm-online-list').append('<li class=cm-message-name id="user-'+user.name+'"><div>'+user.name+'</div><div class="cm-message-status '+status.classname+'">'+status.message+'</div></li>');
    }
    function refreshUser(user) {
        $('#user-'+user.name).remove();
        appendUser(user);
    }
    function removeUser(username) {
        $('#user-'+username).remove();
    }
    function changeTyping(data) {
        var status = $('#user-'+data.name).find('.cm-message-status');
        if (data.istyping) status.addClass('typing');
        else status.removeClass('typing');
    }
    function postMessage() {
        var msg = input.val();
        if (!msg) return;
        if (msg.startsWith('/')) {
            msg = msg.slice(1);
            ActionMessage(msg);
            input.val('');
            return;
        }

        socket.emit('send message', msg);
        input.val('').attr('disabled', 'disabled');
        checkTyping();

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
        sess_token = ''; sess_user = '';
        $.removeCookie('sess_token');
        $.removeCookie('sess_user');
        $('#chat-me').find(tabs).remove();
        $('#chat-me').prepend(inlinebtns.container);
        $('#chat-me-cont').html('');
        $('#chat-me-cont').append('<label for=cm-user class=cm-label>Username:</label><input type=text id=cm-user class=cm-input placeholder=Username></input><br>');
        $('#chat-me-cont').append('<label for=cm-pass class=cm-label>Password:</label><input type=password id=cm-pass class=cm-input placeholder=Password></input><br>');
        $('#chat-me-cont').append('<div id=cm-error-cont></div>');
        $('#chat-me-cont').append('<div style="position:absolute; bottom:28%; right:6%; width:140px;"><button style="left:0%; height:20px;" id=cm-login class=cm-button>Login</button><button style="right:0%; height:20px; background:transparent; color:white; text-decoration:none;" id=cm-register class=cm-button>Sign up</button></div>');

        $('#cm-login').click(function() {
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
                    $.cookie('sess_token', sess_token);
                    $.cookie('sess_user', sess_user);
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

        inlinebtns.appendbtns(displaytype);

    }
    function RegisterDisplay(user, pass) {
        setDisplayStyle('register');
        $('#chat-me').find(tabs).remove();
        $('#chat-me-cont').html('<div style="font-weight:bold; color:white; margin-bottom:-8px; margin-top:-36px;">Register</div><br>');
        $('#chat-me-cont').append('<div class=reg-up width:100%;"><label for=cm-user class=cm-label>Username:</label><input style="width:20%;" type=text id=cm-user class=cm-input placeholder=Username></input>  <label style="width:50px;" for=cm-email class=cm-label>E-mail:</label><input style="width:25%;" type=text id=cm-email class=cm-input placeholder=E-mail></input></div>');
        $('#chat-me-cont').append('<div class=reg-down width:100%;"><label for=cm-pass class=cm-label>Password:</label><input style="width:20%;" type=password id=cm-pass class=cm-input placeholder=Password></input>  <label style="width:50px;" for=cm-confirm class=cm-label>Confirm:</label><input style="width:25%;" type=password id=cm-confirm class=cm-input placeholder=Confirm></input></div>');
        $('#chat-me-cont').append('<div id=cm-error-cont></div>');
        $('#chat-me-cont').append('<div style="position:absolute; bottom:28%; right:6%; width:140px;"><button style="left:0%; height:20px;" id=cm-back class=cm-button>Back</button><button style="right:0%; height:20px;" id=cm-register class=cm-button>Sign up!</button></div>');

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

        inlinebtns.appendbtns(displaytype);
    }
    function LoggedDisplay() {
        setDisplayStyle('logged');

        socket = io();

        socket.emit('define user', sess_user);


        socket.on('initchat', function() {
            switchchat($('.global-tab')); //change with cookie last chat
        });

        socket.on('new message', function (message) {
            input.removeAttr('disabled');
            input.focus();
            var chatvolume = chats[message.roomname].volume;
            if (chatvolume) notifsound();
            setMessage(message.msg);
        });
        socket.on('history_users', function(data) {
            setHistory(data.history);
            setUsers(data.users);
        });
        socket.on('refresh_user', function(user) {
            refreshUser(user);
        });
        socket.on('remove_user', function(username) {
            removeUser(username);
        });
        socket.on('user_typing', function(data) {
            changeTyping(data);
        });
        socket.on('set room', function(room) {
            hideOpts();

            chats[room.name] = {volume: true};

            $('.chat-tab[data-name='+room.name+']').remove();
            var newTab = $('<div class="chat-tab custom" data-type="custom" data-name="' + room.name + '" data-pass="' + room.pass + '"><span class="volume-icon vol-true"></span><div class="tab-text">'+room.name+'</div><i class="fa fa-times remove-tab"></i></div>');
            newTab.addClass(room.pass ? 'pass' : 'free');
            tabs.append(newTab);
            selectchat(room.name);
        });
        socket.on('rooms result', function(result) {
            hideOptsWait();
            $('.search-body').html('');
            if (!result.rooms.length) {
                $('.search-body').append('<center style="color:darkgrey; font-weight:bold; margin-top:25px;"><i>no results found</i></center>');
                return;
            }
            result.rooms.forEach(function(room) {
                var roomresult = $(roomresultModel.cloneNode(true));
                var typeclass = room.haspass ? 'pass' : 'free';

                var htmlquery = '<span class="sel">' + result.query + '</span>';
                var htmlname = room.name.replace(result.query, htmlquery);

                roomresult.addClass(typeclass).data('name', room.name).find('.chat-name').html(htmlname);
                roomresult.find('.online-num').html(room.users);

                
                $('.search-body').append(roomresult);
            });
        });
        socket.on('jsonerror', function(error) {
            switch (error.type) {
                case 'stderror':
                    console.log(error.message);
                    break;
                case 'wrongpassword':
                hideOptsWait();
                    var tab = $('.chat-tab[data-name=' + error.data.name + ']');
                    leaveChat(tab);
                    $('#type-password-message').html(error.message);
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

        var bigwheel = $('<img src="https://media.tenor.com/images/85d269dc9595a7bcf87fd0fa4039dd9f/tenor.gif" style="width:30px; margin:auto; margin-top:100px;">')[0];

        $('#chat-me').find(tabs).remove();
        $('#chat-me').prepend(tabs);


        $('#chat-me-cont').html('');
        $('#chat-me-cont').append('<div id="chat-me-label"></div>');
        $('#chat-me-label').append(inlinebtns.container)
            .append('<div id="cm-display-panel"></div>')
            .find('#cm-display-panel').append('<div id=cm-online class="cm-scroll"> <ul id=cm-online-list></ul> </div>')
                .append('<div id=cm-chat class="cm-scroll"> <div id=cm-chat-list></div> </div>');
        $('#chat-me-label').append('<div id="cm-message-panel"></div>')
        .find('#cm-message-panel').append('<div class="message-input-cont"></div>')
        .find('.message-input-cont').append('<input style="margin:0px; width:100%; height:100%;" type=text id=cm-message-input class=cm-input placeholder=Message>');
        $('#cm-message-panel').append('<button style="position:absolute; top:0; right:0;" id=cm-send class=cm-button>Send</button>');

        $('#cm-chat-list').html(bigwheel);

        input = $('#cm-message-input');

        input.keydown(function(e) {
            e = e || event; // to deal with IE
            if (e.keyCode == 13) postMessage();
        });

        $('#cm-send').click(postMessage);

        inlinebtns.appendbtns(displaytype);
    }

    $(function main() {
        /*css*/ $('head').append('<style type=text/css>body {margin: 0;} #chat-me {position:relative; overflow:hidden; height:100vh;} #chat-me-cont {box-sizing:border-box; padding:5px; padding-top:28px; width:100%; height:100%; background-color:rgba(50,80,100,1.0); border:1px solid rgb(100,130,100); border-radius:3px; font-family:tahoma !important;} #cm-inline-btns {position:absolute; box-sizing:border-box; width:100%; height:15px; margin-bottom:6px;} #cm-message-panel {position: absolute; bottom:0; height:25px; width:100%;} .cm-label {display:inline-block; color:rgb(230,230,230); font-weight:bold; margin:10px; width: 25%;} .cm-button {position:absolute; width:65px; font-size:10px; background-color:rgb(10,200,50); border:0px; box-shadow:none !important; cursor:pointer; height:100%; border-radius: 2px;} .message-input-cont {box-sizing:border-box; width: 100%; height:100%; padding-right:70px;} .cm-input {box-sizing:border-box; background-color:rgb(240,240,240)!important; border:0px; font-size:12px!important; width:230px; border:0px; border-radius:2px;} #cm-error-cont {color:rgb(220,0,0); font-size:12px; margin-left:8px; margin-top:10px; max-width:200px} #cm-chat {width:100%; margin-left:5px; height:100%; background-color:rgb(240,240,240); border-radius:2px;} #cm-chat-list {margin:0; padding:3px 5px; font-size:11px;} .cm-message:first-child {margin-top:0 !important} .cm-message {margin-top:3px; border-bottom:1px solid #ddd; padding-bottom:2px;} .cm-message-name {font-family:\'Montserrat\', sans-serif; font-weight:bold; color:rgb(0,80,0); font-size:9px;} .cm-message-status {font-family:\'Montserrat\', sans-serif; color:grey; font-size: 8px;} .cm-message-text {display:block; margin-left: 3px; margin-right:10px; max-width:310px; word-wrap:break-word; color:rgb(30,30,30)} .cm-message-date {float:right; color:grey;} #cm-display-panel {display:flex; box-sizing:border-box; padding-top:20px; padding-bottom:30px; height: 100%; } #cm-online {width:80px; height:100%; padding-left:4px; background-color:rgb(240,240,240); border-radius:2px;} #cm-online-list {margin:0; padding:5px 0; font-size:11px;}</style>');
        if (!$('#chat-me-cont').length) return;

/*        sess_user = "speep90";
        LoggedDisplay();

        return;
*/

        if (!sess_token || !sess_user) InitDisplay();
        else LoggedDisplay();
    });

})();

var options = $('#chat-me-options');

var spinner = $('<center id="opts-spinner-cont" style="display:none;"><div class="opts-spinner"></div></center>');

options.prepend(spinner);

var chatOptions = {
    display : {
        options : '<div class="options-center"><div class="options-block"><div class="option" onclick="chatOptions.searchChatDis()">SEARCH CHAT</div><div class="option" onclick="chatOptions.addchatDis()">ADD CHAT</div><div class="option" onclick="chatOptions.settingsDis()">SETTINGS</div></div></div>',

        settings : '<div id="settings"><div class="settings-row"><span class="settings-text">Window size:</span><select id="select-size" class="settings-select">'
              + '<option class="settings-option" value="xs">small</option><option class="settings-option" value="sm">medium</option><option class="settings-option" value="lg">large</option><option class="settings-option" value="res">custom (resizable)</option></select></div>'
              + '<div class="settings-row"><span class="settings-text">Theme:</span><select id="select-theme" class="settings-select">'
              + '<option class="settings-option">default</option><option class="settings-option">dark</option><option class="settings-option">holo</option></select></div></div>',

        searchchat: '<div class="search-chat"><div id="type-password-mod" style="display:none"><i class="fa fa-remove hidetypepass" onclick="hideTypePass()"></i><div class="type-password-cont"><div id="type-password-text">password for room <div id="type-password-name"></div></div><input id="type-password" type="password" placeholder="password" autofocus="true"><div id="type-password-message"></div></div></div><center class="search-chat-cont"><input class="search-chat-input" placeholder="Search chat" autofocus="true"><span class="search-chat-icon"></span></center><hr class="search-div"><div class="search-body"></div></div>',

        addchat : '<div class="add-chat"> <center> <label>Chat name: <input id="addchat-name" type="text" maxlength="30"></label> <label>Chat password (empty for no password): <input id="addchat-pass" type="password" maxlength="15"></label> <button class="addchat-btn" onclick="chatOptions.submitChat()">ADD CHAT</button> <div id="addchat-message"></div> </center> </div>',
    },

    container : $('#options-content'),
    spinner: null,

    initOptions : function() {
        chatOptions.container.html(chatOptions.display.options);
        spinner.hide();
    },
    settingsDis: function() {
        chatOptions.container.html(chatOptions.display.settings);
    },
    searchChatDis: function() {
        chatOptions.container.html(chatOptions.display.searchchat);
    },
    addchatDis : function() {
        chatOptions.container.html(chatOptions.display.addchat);
    },
    submitChat : function() {
        chatOptions.container.find('#addchat-message').html('');
        var chatname = chatOptions.container.find('#addchat-name').val();
        var chatpass = chatOptions.container.find('#addchat-pass').val();
        showOptsWait('full');
        socket.emit('create room' , {name: chatname, pass: chatpass});
    }
}

var inlinebtns = {
    container: $('<div id="cm-inline-btns"></div>'),
    btns: {
        minbtn: {init: $('<span class="btn min-btn">_</span>'), element: undefined, display: 'init,logged,register'},
        optsbtn: {init: $('<span class="btn opts-btn"></span>'), element: undefined, display: 'logged'},
        statusbtn: {init: $('<span class="btn status-btn-container modal-toggle"><div class="modal status-modal"><div class="modal-body"></div></div></span>'), element: undefined, display: 'logged'}
    },
    data : {
        statusmodal : [
            {name: 'Online', value: 'online'},
            {name: 'Offline', value: 'offline'},
            {name: 'Busy', value: 'busy'},
            {name: 'Away from keyboard', value: 'afk'},
            {name: 'At the toilet', value: 'toilet'}
        ]
    },
    initbtns: function() {

        var buttons = this.btns;

        /* optsbtn */
        buttons.optsbtn.element = $(buttons.optsbtn.init[0].cloneNode(true));
        buttons.optsbtn.element.click(function() {
            options.show();
            chatOptions.initOptions();
        });
        /* minbtn */
        buttons.minbtn.element = $(buttons.minbtn.init[0].cloneNode(true));
        buttons.minbtn.element.click(function() {
            postParentMessage('minify');
        });
        /* status btn */
        buttons.statusbtn.element = $(buttons.statusbtn.init[0].cloneNode(true));
        buttons.statusbtn.element.click(function(e) {
            $(this).find('.status-modal').toggle();
        });
        inlinebtns.data.statusmodal.forEach(function(status) {
            var statusrow = $('<div class="status-row" data-val="'+status.value+'">'+status.name+'</div>');
            statusrow.click(function() { socket.emit('change_status', $(this).data('val')); });
            buttons.statusbtn.element.find('.modal-body').append(statusrow);
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
            inlinebtns.container.append(button.element);
        }
    }
};

function switchchat(tab) {
    tab = $(tab);
    roomtype = tab.data('type');
    roomname = roomtype == 'site' ? site : tab.data('name');
    roompass = tab.data('pass');
    
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
        tabs.find('.chat-tab[data-name=' + chat + ']').addClass('sel');
    } else if (typeof chat == 'object') {
        tabs.find(chat).addClass('sel');
    }
}

function removeTab(el) {
    leaveChat($(el).parent());
}

function leaveChat(tab, callback) {
    callback = callback || function() {}
    prevTab = tab.prev();
    tab.remove();
    switchchat(prevTab);
}
function checkTyping() {
    var typing = !!$('#cm-message-input').val();
    if (prevtyping != typing) {
        prevtyping = typing;
        socket.emit('typingstatus', typing);
    }
}
function switchvolume(tab) {
    var chatname = $(tab).data('name');
    var volume = chats[chatname].volume;
    chats[chatname].volume = !volume;
    $(tab).find('.volume-icon').removeClass('vol-'+volume).addClass('vol-'+!volume);
}

$('#chat-me').click(function(e) {
    if ($(e.target).is(':not(.modal,.modal-toggle)')) $('.modal').hide();
});

$(document).on('click', '.chat-tab', function(e) {
    if ($(e.target).is('.remove-tab')) removeTab(e.target);
    else if ($(e.target).is('.volume-icon')) switchvolume(this);
    else if ($(this).is(':not(.sel)')) switchchat(this);
});

function hideOpts() {
  options.hide();
}

$(document).on('mouseenter', '.option', function() {
  $(this).css({
    'background-color': 'rgb(157,162,164)',
    'color'           : 'navajowhite'
});
  $(this).animate({
    'font-size': '13px'
}, {queue: false, duration: 50});
}).on('mouseleave', '.option', function() {
  $(this).css({
    'background-color': '',
    'color': ''
});
  $(this).animate({
    'font-size': '11px'
}, {queue: false, duration: 50});
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
function showOptsWait(typeclass='full') { //typeclass can be 'full' or 'light'
    spinner.removeClass('full light').addClass(typeclass).show();
}

function hideOptsWait() {
    spinner.hide();
}

function showTypePass(roomname) {
    $('#type-password-name').html(roomname);
    $('#type-password-mod').data('name', roomname).show();
}

function hideTypePass() {
    $('#type-password-message').empty();
    $('#type-password-mod').hide();
}

function joinPassRoom() {
    $('#type-password-message').empty();
    var roomname = $('#type-password-mod').data('name');
    var roompass = $('#type-password').val();
    var room = {
        name: roomname,
        pass: roompass
    };
    socket.emit('join room', room);
}
function postParentMessage(key, value) {
    parent.postMessage({key: key, value: value, type: 'cm-event'}, '*');
}

$(document).on('click', '.chat-row', function() {
    roomname = $(this).data('name');
    var room = {name: roomname};
    if ($(this).is('.free')) {
        socket.emit('join room', room);
    }
    else {
        showTypePass(roomname);
    }
}).on('keydown', '#type-password', function(e) {
    e = e || event; // to deal with IE
    if (e.keyCode == 13) joinPassRoom();
});

$(document).on('change', '#select-size', function() {
    postParentMessage('windowsize', $(this).val());
});

$(document).on('keyup', '#cm-message-input', checkTyping);

window.addEventListener('message', function(event) { 
    console.log(event.data);
});