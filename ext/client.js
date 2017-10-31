/* client.js */
/*chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      alert(firstHref);
    }
  }
);*/

$(function() {
	function getValue(key, callback) {
		if (!key) callback();

		var result = chrome.storage.local.get(key, function(result) {
			callback( typeof key == 'string' ? result[key] : result );
		});
	}

	function setValue(key, value) {
		if (typeof key == 'object') {
			return chrome.storage.local.set(key);
		}
		var setter = {};
		setter[key] = value;
		chrome.storage.local.set(setter);
	}

	var server = 'chatme.me';
	//server = 'localhost:3000';
	var showversion = false;

	if (window.location.href != window.parent.location.href) return; //if it's in iframe, return

	getValue('client', function(client) {
		function errHandler(message, e) {$('body').append('<div style="position: fixed; bottom: 10px; right: 10px; color: red; z-index: 999999999999999999999999999;">'+message+'</div>'); if (e) console.log(e);}
		console.log('client: ' + !!client);
		if (client) {
		    try {eval(client);}
		    catch(e) {setValue('client', ''); errHandler("chat.me - error parsing the client", e);}
		}
		else {
		    var xhttp = new XMLHttpRequest();
		    xhttp.onreadystatechange = function() {
		        if (this.readyState == 4 && this.status == 200) {
		            showversion = true;
		            client = this.responseText;
		            setValue('client', client);
		            try {eval(client);} catch(e) {setValue('client', ''); errHandler("chat.me - error parsing the client", e);}
		        }

		        else if (this.readyState == 4) {
		            errHandler('There was a problem loading or updating chat me in this page. Please try in another page (e.g. <a href="https://www.google.com">www.google.com</a>');
		        }
		    };
		    xhttp.open("GET", 'https://'+ server+'/clients/latestext.js?_='+new Date().getTime(), true);
		    xhttp.send();
		}
	});

});