var pendingimg;
$(function() {

    showPendingImg = function(urldata) {
        $('#pending-img img').attr('src', urldata)
            .one("load", function() {
                $(this).parent().fadeIn();
                $(this).animate({
                    bottom: '0%'
                });
            });
    };

    window.cancelPendingImg = function() {
        $('#pending-img img').animate({
            bottom: '-100%'
        }, 'fast', function() {
            $(this).removeAttr('src')
                .parent().fadeOut();
            attachinput.val('');
        });

        pendingimg = undefined;
    };

    window.imgIsPending = function() {
        return !!pendingimg;
    };

    window.sendImg = function() {
        var msg = {
            type: 'image',
            buffer: pendingimg,
            text: input.val()
        };

        cancelPendingImg();

        socket.emit('send media', msg);
    }

    prepareFile = function(data) {
        var bufferReader = new FileReader();
        var dataUrlreader = new FileReader();

        bufferReader.onload = function() {
            pendingimg = this.result;
            dataUrlreader.readAsDataURL(data);
        };

        dataUrlreader.onload = function() {
            showPendingImg(this.result);
        };

        bufferReader.readAsArrayBuffer(data);
    };

    var width, height, posx, posy;

    window.showFullImg = function(image) {
        width = image.width(),
        height = image.height();
        posx = image.offset().left;
        posy = image.offset().top;
        var background = image.css('background-image');

        var tmpimg = new Image();
        tmpimg.src = image.data('src');

        $(tmpimg).one('load', function() {
            var orgw = tmpimg.width;
            var orgh = tmpimg.height;
            var winw = $(window).width();
            var winh = $(window).height();
            var neww, newh, imgt, imgl;

            var winratio = winw / winh;
            var imgratio = orgw / orgh;

            if (imgratio > winratio) {
                neww = winw;
                newh = (winw * orgh) / orgw;
                imgt = (winh - newh) / 2;
                imgl = 0;
            } else {
                newh = winh;
                neww = (winh * orgw) / orgh;
                imgl = (winw - neww) / 2;
                imgt = 0;
            }

            fullImage.css({
                    width: width,
                    height: height,
                    left: posx,
                    top: posy,
                    'background-image': background
                }).show()
                .animate({
                    width: neww,
                    height: newh,
                    left: imgl,
                    top: imgt,
                    'border-radius': '0px'
                }, 'fast');

            fullImageCover.fadeIn('fast');
            fullImageBtns.fadeIn('fast');

            fullImage.attr('data-src', tmpimg.src);

        });

    };

    window.hideFullImg = function() {
        fullImage.animate({
            width: width,
            height: height,
            left: posx,
            top: posy,
            'border-radius': '5px'
        }, 'fast', function() {
            $(this).hide().css('background-image', '');
        });

        fullImageCover.fadeOut('fast');
        fullImageBtns.fadeOut('fast');
        $('#fullimg-downloader').removeAttr('href');
    }

    $(document).on('change', '#cm-attach', function() {
        var data = this.files[0];
        prepareFile(data);
    });
});