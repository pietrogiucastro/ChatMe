// ==UserScript==
// @name         Chat.me
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Welcome to Chat.me! Chat.me is a free non-profit embedded in-frame chat. Chat and send medias to your friends or averyone all over the world.
// @author       Pietro Giucastro (pietrogiucastro@alice.it)
// @match        https://*
// @match        http://*
// @match        https://*/*
// @match        http://*/*
// @require      http://code.jquery.com/jquery-latest.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

var server = 'chatme.me';
var showversion = false;

if (window.location.href != window.parent.location.href) return; //if it's in iframe, return

var client = GM_getValue('client');

function errHandler(message, e) {$('body').append('<div style="position: fixed; bottom: 10px; right: 10px; color: red; z-index: 999999999999999999999999999;">'+message+'</div>'); if (e) console.log(e);}

if (client) {
    try {eval(client);}
    catch(e) {GM_setValue('client', ''); errHandler("chat.me - error parsing the client", e);}
}
else {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            showversion = true;
            client = this.responseText;
            GM_setValue('client', client);
            try {eval(client);} catch(e) {errHandler("chat.me - error parsing the client", e);}
        }

        else if (this.readyState == 4) {
            errHandler('There was a problem loading or updating chat me in this page. Please try in another page (e.g. <a href="https://www.google.com">www.google.com</a>');
        }
    };
    xhttp.open("GET", 'https://'+ server+'/clients/latest.js?_='+new Date().getTime(), true);
    xhttp.send();
}