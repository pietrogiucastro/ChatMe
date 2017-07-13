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


var input;

(function() {
    'use strict';

    if (document.domain == settings_page) return document.write('chat me settings. Under construction..');
    if (document.domain == server) return;
    if (window.location.href != window.parent.location.href) return; //if it's in iframe, return

    !function main() {
        /*css*/ $('head').append('<style type=text/css>#chat-me-cont {position:fixed; z-index:99999999999999999999; box-sizing:border-box; padding:11px; bottom:20px; right:20px; width:404px; height:174px; background-color:rgba(50,80,100,1.0); border:1px solid rgb(100,130,100); border-radius:3px; font-family:tahoma !important;} .cm-label {display:inline-block; color:rgb(230,230,230); font-weight:bold; margin:10px; width:65px;} .cm-button {position:absolute; width:65px; font-size:10px; background-color:rgb(10,200,50); border:0px; box-shadow:none !important;} .cm-input {background-color:rgb(240,240,240)!important; border:0px; font-size:12px!important; width:230px; height:9px; border:0px; border-radius:2px;} #cm-error-cont {color:rgb(220,0,0); font-size:12px; margin-left:8px; margin-top:10px; max-width:200px} #cm-chat {width:81%; height:80%; background-color:rgb(240,240,240); border-radius:2px; overflow-y:scroll; float:right;} #cm-chat-list {margin:0; padding:5px; font-size:11px;} .cm-message-name {font-weight:bold; margin-right:10px; color:rgb(0,130,0);} .cm-message-text {display:block; margin-right:10px; max-width:310px; word-wrap:break-word; color:rgb(30,30,30)} .cm-message-date {float:right; color:grey;} #cm-online {width:60px; height:80%; float:left; margin-left:1px; background-color:rgb(240,240,240); overflow-y:scroll; border-radius:2px;} #cm-online-list {margin:0; padding:5px; font-size:11px;}</style>');
        $('head').append('<style type=text/css>#chat-me-cover { position:absolute; width:100%; height:100%; background-color:rgb(50,80,100); top:0; opacity:0.0; display:none; cursor:pointer; } #cm-frame-tabs { position:absolute; margin:0; z-index:-1; top:0; right:1px; padding:0 6px; font-size:30px; line-height:15px; background:#ddd; cursor:pointer } #chat-me-container {position: fixed; z-index:99999999999999999999; bottom:20px; right:20px; width:404px; height:198px;} #chat-me-frame {border:0; width:100%; height:100%; overflow:hidden;} </style>');
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

        function hideChatMe() {
            $('#cm-frame-tabs').hide();
            $('#chat-me-cover').show();
            $('#chat-me-cover').animate({
                opacity: '1.0',
                'border-radius': '50%'
            }, 300);
            $('#chat-me-frame').animate({
                'border-radius': '50%'
            }, 300);
            $('#chat-me-container').animate({
                width: '40px', height: '40px',
                bottom: '30px', right: '30x'
            }, 300);
        }
        //         worth it?           //
        var dragging = false;
        var cover = document.getElementById('chat-me-cover');
        var container = document.getElementById('chat-me-container');
        console.log(cover);
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
        };
        
        // ////////////////////// //
    }();

})();