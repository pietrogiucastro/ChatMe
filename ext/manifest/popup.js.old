$(function() {
	$('#cm-onoff').click(function() {
		var newstatus = $(this).attr('status') == 'on' ? 'off' : 'on';

		$(this).attr('status', newstatus)
		.find('.switch-track').stop().animate({
			left: newstatus == 'off' ? '-100%' : '0%'
		}, 180);
		$(this).children('.switch-thumb').stop().animate({
			left: newstatus == 'off' ? '0' : '26px'
		}, 200, function() {
			chrome.storage.local.set({status: newstatus});
		});

	});

	$('#cm-refresh').click(function() {
		postContentScriptMessage('reset-client', undefined, function() {
			window.close();
		});
	});

	!function init() {
		chrome.storage.local.get('status', function(response) {
  			var status = response.status || 'on';
  			$('#cm-onoff').attr('status', status)
  			.find('.switch-track').css('left', status == 'off' ? '-100%' : '0%');
  			$('#cm-onoff').children('.switch-thumb').css('left', status == 'off' ? '0' : '26px');
  		});
	}();
});

function postContentScriptMessage(key, value, callback) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {key: key, value: value}, callback);
	});
}