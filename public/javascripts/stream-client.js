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

    window.bufferToBase64 = function(buf) {
        var binstr = Array.prototype.map.call(buf, function(ch) {
            return String.fromCharCode(ch);
        }).join('');
        return btoa(binstr);
    }

    attachinput.change(function() {
        var data = this.files[0];
        prepareFile(data);

        //var stream = ss.createStream();

        // upload a file to the server. 
        //ss(socket).emit('file', stream, {size: file.size});
        // ss(socket).emit('file', file.toString('base64'), {size: file.size});

        //var blobStream = ss.createBlobReadStream(file).pipe(stream);

        // var size = 0;

        /*    blobStream.on('data', function(bytes) {
            	size += bytes.length;
            	console.log(Math.floor(size / file.size * 100) + '%');
        	});
            blobStream.pipe(stream);
        */
    });
});