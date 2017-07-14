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

var shw = '404px', shh = '174px',
    hiw = '30px', hih = '30px',
    hir = '20px', hib = '20px';

var input;

(function() {
    'use strict';

    if (document.domain == settings_page) return document.write('chat me settings. Under construction..');
    if (document.domain == server) return;
    if (window.location.href != window.parent.location.href) return; //if it's in iframe, return

    !function main() {
        $('head').append('<style type=text/css>#chat-me-cover { position:absolute; width:100%; height:100%; background-color:rgb(50,80,100); top:0; opacity:0.0; display:none; cursor:pointer; } #cm-frame-tabs { position:absolute; margin:0; z-index:-1; top:0; right:1px; padding:0 6px; font-size:30px; line-height:15px; background:#ddd; cursor:pointer } #chat-me-container {position: fixed; z-index:99999999999999999999; bottom:20px; right:20px; width:' + shw + '; height:' + shh + ';} #chat-me-frame {border:0; width:100%; height:100%; overflow:hidden;} </style>');
        $('head').append('<style type=text/css> #cm-frame-tabs.cm-hidden { display:none !important; } </style>');
        $('body').append('<div id="chat-me-container"></div>');
        $('#chat-me-container').append('<button id="cm-frame-tabs">-</button>');
        $('#chat-me-container').append('<iframe id="chat-me-frame" src="https://'+server+':60000/"></iframe><div id="chat-me-cover"></div>');

        $('#chat-me-container').mouseenter(function() {
            $('#cm-frame-tabs').show();
            $('#cm-frame-tabs').animate({
                top: '-20px'
            }, {duration: 60, queue: false});
        }).mouseleave(function(){
            $('#cm-frame-tabs').animate({
                top: '0px'
            }, {duration: 60, queue: false});
        });
        $('#cm-frame-tabs').click(hideChatMe);
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
            $('#cm-frame-tabs').addClass('cm-hidden');
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
            $('#cm-frame-tabs').addClass('cm-hidden');
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
            $('#cm-frame-tabs').removeClass('cm-hidden');

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
            }, 200);
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
    }();

})();