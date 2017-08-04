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
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
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

var shw = '404px',shh = '174px',
    hiw = '30px', hih = '30px',
    hir = '20px', hib = '20px';

var input;

if (document.domain == "www.youtube.com") return;

console.log(window.location.href);

if (window.location.href != window.parent.location.href) return; //if it's in iframe, return
if (document.domain == "web.whatsapp.com") return;

(function() {
    'use strict';

    if (document.domain == settings_page) return document.write('chat me settings. Under construction..');
    if (document.domain == server) return;

    $('head').append('<style type=text/css>#chat-me-cover { position:absolute; width:100%; height:100%; background-color:rgb(50,80,100); top:0; opacity:0.0; display:none; cursor:pointer; } #chat-me-container {position: fixed; z-index:99999999999999999999; bottom:20px; right:20px;} #chat-me-frame {border:0; width:100%; height:100%; overflow:hidden;} </style>');

    $('head').append('<style type=text/css>.xs {width: 380px; height: 194px;} .sm {width: 400px; height: 280px} .lg {width: 380px; height: 460px;}</style>');

    $('body').append('<div id="chat-me-container" class="lg"></div>');
    $('#chat-me-container').append('<iframe id="chat-me-frame" src="https://'+server+':60000/"></iframe><div id="chat-me-cover"></div>');

    $('#chat-me-cover').click(showChatMe);

    var container = document.getElementById('chat-me-container');

    var windoww = $(window).width();
    var windowh = $(window).height();

    $(window).mousemove(function(event) {

        if($(container).is(':not(.cm-hidden)')) return;

        event = event || window.event; // IE-ism
        var cursorX = windoww - event.clientX;
        var cursorY = windowh - event.clientY;

        if(cursorX < 120 && cursorY < 120 && $(container).is('.cm-out')) {
            inChatMe();
        }
        else if (cursorX > 120 && cursorY > 120 && $(container).is(':not(.cm-out)')) {
            outChatMe();
        }

    });

    function setChatMeHidden() {
        $('#chat-me-cover').show();
        $('#chat-me-cover').css({
            opacity: '1.0',
            'border-radius': '50%'
        });
        $('#chat-me-frame').css({
            'border-radius': '50%'
        });
        $('#chat-me-container').addClass('cm-hidden').css({
            width: hiw, height: hih,
            bottom: '10px', right: '10x'
        });
    }

    function hideChatMe() {
        shw = $('#chat-me-container').width();
        shh = $('#chat-me-container').height();

        $('#chat-me-cover').show();
        $('#chat-me-cover').animate({
            opacity: '1.0',
            'border-radius': '50%'
        }, 200);
        $('#chat-me-frame').animate({
            'border-radius': '50%'
        }, 200);
        $('#chat-me-container').addClass('cm-hidden').animate({
            width: hiw, height: hih,
            bottom: '10px', right: '10x'
        }, 200);
        GM_setValue('isHidden', '1');
    }
    function showChatMe() {
        $('#chat-me-cover').animate({
            opacity: '0.0',
            'border-radius': '0%'
        }, 200, function() {
            $('#chat-me-cover').hide();
        });
        $('#chat-me-frame').animate({
            'border-radius': '0%'
        }, 200);

        $('#chat-me-container').removeClass('cm-hidden').animate({
            width: shw, height: shh,
            bottom: hib, right: hir
        }, 200, function() {
            $(this).css({
                'width': '',
                'height': '',
                'bottom': '',
                'right': ''
            });
        });
        GM_setValue('isHidden', '');
    }
    function outChatMe() {
        $(container).addClass('cm-out');
        var outr = '-'+hiw;
        var outb = '-'+hih;
        $(container).animate({
            bottom: outr,
            right: outb
        }, {duration: 100, queue: false});
    }
    function inChatMe() {
        $(container).removeClass('cm-out');
        $(container).animate({
            bottom: hib,
            right: hir
        }, {duration: 100, queue: false});
    }
    function resizableChatMe() {
        $('#chat-me-container').resizable({handles: 'n, w, nw', minWith: 150, minHeight: 100});
    }
    window.setWindowSize = function(size) {
        $('#chat-me-container').removeClass().addClass(size);
        if (size == 'res') resizableChatMe();
    };


    if (GM_getValue('isHidden')) {
        setChatMeHidden();
    }


    //         worth it?           //
    var dragging = false;
    var cover = document.getElementById('chat-me-cover');
    /*console.log(cover);
        cover.onmousedown = function() {
            dragging = true;
            console.log('asd');
        };
        cover.onmouseup = function() {
            dragging = false;
        };
        cover.onmousemove = function(event) {
            if (!dragging) return;
            event = event || window.event; // IE-ism
            var cursorX = (event.pageX-20)+'px';
            var cursorY = (event.pageY-20)+'px';

            $(container).css('top', cursorY).css('left', cursorX);

            console.log(cursorX + "  " + cursorY);
        };*/

    // ////////////////////// //


    window.addEventListener('message', function(event) {
        if (event.data.type != 'cm-event') return;
        switch (event.data.key) {
            case "windowsize":
                setWindowSize(event.data.value);
                break;
            case "minify":
                hideChatMe();
                break;
            default:
                console.log('unhandled event: ' + event.data);
        }
    });

})();

function postChildMessage(key, value) {
    var cmframe = document.getElementById('chat-me-frame');
    if (!cmframe) return;
    cmframe.contentWindow.postMessage({key: key, value: value, type: 'cm-event'}, '*');
}

(function() {
    var hidden = "hidden";

    // Standards:
    if (hidden in document)
        document.addEventListener("visibilitychange", onchange);
    else if ((hidden = "mozHidden") in document)
        document.addEventListener("mozvisibilitychange", onchange);
    else if ((hidden = "webkitHidden") in document)
        document.addEventListener("webkitvisibilitychange", onchange);
    else if ((hidden = "msHidden") in document)
        document.addEventListener("msvisibilitychange", onchange);
    // IE 9 and lower:
    else if ("onfocusin" in document)
        document.onfocusin = document.onfocusout = onchange;
    // All others:
    else
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;

    function onchange (evt) {
        var v = "cm-focus", h = "cm-blur",
            action,
            evtMap = {
                focus:v, focusin:v, pageshow:v, blur:h, focusout:h, pagehide:h
            };

        evt = evt || window.event;
        if (evt.type in evtMap) {
            action = evtMap[evt.type];
            if (document.body.cmstate == action) return;
            document.body.cmstate = action;
            //console.log(action);
            postChildMessage('page-state', action);
        } else {
            action = this[hidden] ? h : v;
            if (document.body.cmstate == action) return;
            document.body.cmstate = action;
            //console.log(action);
            postChildMessage('page-state', action);
        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if( document[hidden] !== undefined )
        onchange({type: document[hidden] ? "blur" : "focus"});
})();