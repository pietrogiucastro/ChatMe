var connection;
var transparent;
var welcomeMessage = "Welcome to Chat me, %USERNAME%! <br><br> Current version %VERSION% ";

var container;

var shw = '404px',shh = '174px',
hiw = '30px', hih = '30px',
shr = '10px', shb = '10px',
hir = '10px', hib = '10px';

var input;

var sizes = {
    xs: {
        x: '340px',
        y: '200px'
    },
    sm: {
        x: '360px',
        y: '280px'
    },
    lg: {
        x: '380px',
        y: '460px'
    },
    res: {
        x: '300px',
        y: '200px'
    }
};

//# sourceMappingURL=jquery-resizable.min.js.map
!function(e,n){"function"==typeof define&&define.amd?define(["jquery"],e):"object"==typeof module&&"object"==typeof module.exports?module.exports=e(require("jquery")):e(jQuery)}(function(e,n){function t(n,t){return n&&">"===n.trim()[0]?(n=n.trim().replace(/^>\s*/,""),t.find(n)):n?e(n):t}e.fn.resizable||(e.fn.resizable=function(n){var o={handleSelector:null,resizeWidth:!0,resizeHeight:!0,resizeWidthFrom:"right",resizeHeightFrom:"bottom",onDragStart:null,onDragEnd:null,onDrag:null,touchActionNone:!0};return"object"==typeof n&&(o=e.extend(o,n)),this.each(function(){function n(e){e.stopPropagation(),e.preventDefault()}function i(t){t.preventDefault&&t.preventDefault(),s=c(t),s.width=parseInt(d.width(),10),s.height=parseInt(d.height(),10),a=d.css("transition"),d.css("transition","none"),o.onDragStart&&o.onDragStart(t,d,o)===!1||(o.dragFunc=r,e(document).bind("mousemove.rsz",o.dragFunc),e(document).bind("mouseup.rsz",u),(window.Touch||navigator.maxTouchPoints)&&(e(document).bind("touchmove.rsz",o.dragFunc),e(document).bind("touchend.rsz",u)),e(document).bind("selectstart.rsz",n))}function r(e){var n,t,i=c(e);n="left"===o.resizeWidthFrom?s.width-i.x+s.x:s.width+i.x-s.x,t="top"===o.resizeHeightFrom?s.height-i.y+s.y:s.height+i.y-s.y,o.onDrag&&o.onDrag(e,d,n,t,o)===!1||(o.resizeHeight&&d.height(t),o.resizeWidth&&d.width(n))}function u(t){return t.stopPropagation(),t.preventDefault(),e(document).unbind("mousemove.rsz",o.dragFunc),e(document).unbind("mouseup.rsz",u),(window.Touch||navigator.maxTouchPoints)&&(e(document).unbind("touchmove.rsz",o.dragFunc),e(document).unbind("touchend.rsz",u)),e(document).unbind("selectstart.rsz",n),d.css("transition",a),o.onDragEnd&&o.onDragEnd(t,d,o),!1}function c(e){var n={x:0,y:0,width:0,height:0};if("number"==typeof e.clientX)n.x=e.clientX,n.y=e.clientY;else{if(!e.originalEvent.touches)return null;n.x=e.originalEvent.touches[0].clientX,n.y=e.originalEvent.touches[0].clientY}return n}var s,a,d=e(this),h=t(o.handleSelector,d);o.touchActionNone&&h.css("touch-action","none"),d.addClass("resizable"),h.bind("mousedown.rsz touchstart.rsz",i)})})});
var resizeicosrc = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAUVBMVEUAAACqqqr+/v4vLy/6+vr+/v7+/v4AAABzc3Nvb2////+2trbJycnr6+vPz891dXVzc3OhoaF3d3eioqJ9fX2goKC+vr5/f3/Ly8t8fHz+/v4NyOEeAAAAG3RSTlMAjgtAaEpbR3wQA3dyanYndRN+L4g2mjByeR/NwbV+AAAARklEQVR4XmMgDTAzokqwM7KgybMxockzoctziqLJc/ChynNws6LK87ByEZLnF4DLCwoB5YVFeMECYkB5cQmgfkleKQYiAADT4wJh2XodKgAAAABJRU5ErkJggg==";

(function() {
    'use strict';

    if (document.domain == "chat.me") return window.location.href = 'https://chatme.me';
    if (document.domain == server) return;

    $('head').append('<style type=text/css>.chat-me-notloaded {cursor:pointer; display:block !important; background: gray !important;} #chat-me-cover { position:absolute; width:100%; height:100%; background-color:rgb(50,80,100); top:0; opacity:0.0; cursor:pointer; } #chat-me-container {position: fixed; z-index:99999999999999999999; bottom:'+shb+'; right:'+shr+';  border-radius: 5px; } #chat-me-container:not(.cm-hidden) {box-shadow: 2px 2px 1px #111;} #chat-me-container.cm-hidden > #chat-me-frame {pointer-events: none;}  #chat-me-container.resizable:not(.fs):not(.cm-hidden) {min-width: 300px; min-height: 200px; max-width: 100vw; max-height: 100vh; max-width:calc(100vw - '+shr+' - 30px); max-height:calc(100vh - '+shb+' - 20px);} #chat-me-container.resizable:not(.cm-hidden) > #chat-me-frame {border-top-left-radius: 10px !important;} #chat-me-container.resizable:not(.cm-hidden) #chat-me-resbtn {display: block !important;} #chat-me-resbtn {display: none; position: absolute; left: 1px; top: 2px; cursor: nwse-resize;} #chat-me-frame {border:0; width:100%; height:100%; overflow:hidden;} #chat-me-frame.dragging {pointer-events: none;} </style>');

    $('head').append('<style type=text/css>.xs {width: '+sizes.xs.x+'; height: '+sizes.xs.y+';} .sm {width: '+sizes.sm.x+'; height: '+sizes.sm.y+';} .lg {width: '+sizes.lg.x+'; height: '+sizes.lg.y+';} .fs {width: 100% !important; height: 100% !important; left: 0; top: 0; padding: 0 !important;} .chatme-fs {overflow: hidden !important;} </style>');

    $('body').append('<div id="chat-me-container"></div>');
    $('#chat-me-container')
    .append('<img id="chat-me-resbtn" src="'+resizeicosrc+'"></img>')
    .append('<iframe id="chat-me-frame" src="https://'+server+'" allow="microphone"></iframe><div id="chat-me-cover" class="chat-me-notloaded" style="display:none;"></div>');

    $(document).on('click', '#chat-me-container:not(.cm-hidden) .chat-me-notloaded', hideChatMe)
    .on('click', '#chat-me-container.cm-hidden .chat-me-notloaded', showChatMe);

    container = document.getElementById('chat-me-container');

    $(window).mousemove(function(event) {

        if($(container).is(':not(.cm-hidden)')) return;
        event = event || window.event; // IE-ism
        var windoww = $(window).width();
        var windowh = $(window).height();
        var cursorX = windoww - event.clientX;
        var cursorY = windowh - event.clientY;

        if(cursorX < 120 && cursorY < 120 && $(container).is('.cm-out')) {
            inChatMe();
        }
        else if ((cursorX > 120 || cursorY > 120) && $(container).is(':not(.cm-out)')) {
            outChatMe();
        }

    });

    $(container).mouseleave(function() {
        if ($(this).is('.fs')) return;
       // hideChatMe();
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
        var outr = '-'+hiw;
        var outb = '-'+hih;
        $(container).addClass('cm-hidden cm-out').css({
            width: hiw, height: hih,
            bottom: outr, right: outb
        });
    }
    function resizableChatMe() {
        getValue(['res_w', 'res_h'], function(data) {

            var _res_w = data.res_w || 300;
            var _res_h = data.res_h || 200;
            shw = _res_w + 'px';
            shh = _res_h + 'px';
            $(container).width(_res_w).height(_res_h).resizable({
                resizeWidthFrom: 'left',
                resizeHeightFrom: 'top',
                handleSelector: '#chat-me-resbtn',
                onDragStart: function() {
                    $('#chat-me-frame').addClass('dragging');
                },
                onDragEnd: function() {
                    $('#chat-me-frame').removeClass('dragging');
                    var res_w = $(container).width();
                    var res_h = $(container).height();
                    setValue({res_w : res_w, res_h: res_h});
                }
            });

        })
    }
    window.setWindowSize = function(size) {
        if (!size || !sizes[size]) size = 'sm';

        $(container).width('').height('').removeClass().addClass(size);
        if (size == 'res') resizableChatMe();
        else {
            shw = sizes[size].x;
            shh = sizes[size].y;
        }

        setValue('size', size);
        postChildMessage('selectedsize', size);
    };

    window.addEventListener('message', function(event) {
        if (event.data.type != 'cm-event') return;

        switch (event.data.key) {
            case 'successload':
                successLoad(event.data.value);
                break;
            case 'refresh-page':
                window.location.reload();
                break;
            case 'update-client':
                setValue({'client': '', 'client-version': event.data.value});
                break;
            case 'reset-client':
                setValue({'client': '', 'client-version': event.data.value});
                window.location.reload();
                break;
            case 'show-welcome':
                postChildMessage('show-welcome', welcomeMessage);
                break;
            case 'transparent':
                transparent = event.data.value;
                if (!transparent) $(container).css('opacity', '');
                break;
            case "windowsize":
                setWindowSize(event.data.value);
                break;
                case "minify":
                hideChatMe();
                break;
            case "togglefs":
                $(container).toggleClass('fs');
                if ($(container).is('.fs')) $('body').addClass('chatme-fs');
                else $('body').removeClass('chatme-fs');
                break;
            default:
                console.log('unhandled event: ' + JSON.stringify(event.data));
        }
    });

    chrome.runtime.onMessage.addListener(
        function(request, sender, callback) {
            switch(request.key) {
                case 'reset-client':
                    postChildMessage('reset-storage');

                    setValue('client', '', function() {
                        window.location.reload();
                        if (callback) callback();
                    });
                break;
            }

        });

    $(container).mouseleave(function() {
        if (!transparent || $(this).is('.fs')) return;
        if ($(this).children('#chat-me-frame').is('.dragging')) return;
        $(this).animate({'opacity': 0.2}, 'fast');
    }).mouseenter(function() {
        if (!transparent) return;
        $(this).animate({'opacity': 1.0}, 'fast');
    });

    !function main() {
        //get size
        getValue('size', function(currentsize) {
            setWindowSize(currentsize);        
        });

        getValue('isHidden', function(isHidden) {
            if (isHidden) setChatMeHidden();
        });
    }();

})();

function outChatMe() {
    if ($(container).is('.sliding')) return;
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
function hideChatMe() {
    if ($(container).is('.fs')) return;
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
    $('#chat-me-container').addClass('cm-hidden sliding').animate({
        width: hiw, height: hih,
        bottom: hib, right: hir
    }, 200, function() {
        $(this).removeClass('sliding');
        outChatMe();
    });
    setValue('isHidden', '1');
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

    $('#chat-me-container').addClass('sliding').animate({
        width: shw, height: shh,
        bottom: shb, right: shr
    }, 200, function() {
        $(this).removeClass('cm-hidden sliding').css({
            'bottom': '',
            'right': ''
        });
    });
    setValue('isHidden', '');
}

function postChildMessage(key, value) {
    var cmframe = document.getElementById('chat-me-frame');
    if (!cmframe) return;
    cmframe.contentWindow.postMessage({key: key, value: value, type: 'cm-event'}, '*');
}

function successLoad(data) {
    console.log('cmloaded');
    $('#chat-me-cover').removeClass('chat-me-notloaded').click(showChatMe);

    transparent = data.transparent;
    if (transparent) $(container).trigger('mouseleave');

    getValue('size', function(size) {
        postChildMessage('selectedsize', size);
    });

    getValue('client-version', function(myClientVersion) {
        myClientVersion = myClientVersion || "0.0.0";
        postChildMessage('client-version', myClientVersion);
        if (showversion) postChildMessage('show-client-version');
    });
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
            postChildMessage('page-state', action);
        } else {
            action = this[hidden] ? h : v;
            if (document.body.cmstate == action) return;
            document.body.cmstate = action;
            postChildMessage('page-state', action);
        }
    }

    // set the initial state (but only if browser supports the Page Visibility API)
    if( document[hidden] !== undefined )
        onchange({type: document[hidden] ? "blur" : "focus"});

})();