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
var server = 'chatme.me';
server = 'localhost:3000';
var version = '001';
var showversion = false;

if (document.domain == "www.youtube.com") return;
if (window.location.href != window.parent.location.href) return; //if it's in iframe, return
if (document.domain == "web.whatsapp.com") return;

var client = GM_getValue('client');

if (client) eval(client);
else {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            showversion = true;
            client = this.responseText;
            GM_setValue('client', client);
            eval(client);
        }

        else if (this.readyState == 4) {
            $('body').append('<div style="position: fixed; bottom: 10px right: 10px; color: red;">There was a problem loading or updating chat me in this page. Please try in another page (e.g. <a href="https://www.google.com">www.google.com</a>)</div>');
        }
    };
    xhttp.open("GET", 'https://'+ server+'/clients/'+version+'.js?_='+new Date().getTime(), true);
    xhttp.send();
}