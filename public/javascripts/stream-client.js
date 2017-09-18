$(function() {
    var pendingimg;

    showPendingImg = function(urldata) {
        $('#pending-img img').attr('src', urldata)
            .one("load", function() {
                $(this).parent().fadeIn();
                $(this).animate({
                    bottom: '0%'
                });
            });
    }

    window.cancelPendingImg = function() {
        $('#pending-img img').animate({
            bottom: '-100%'
        }, 'fast', function() {
            $(this).attr('src', '') // FIX THIS
            .parent().fadeOut();
        });

        pendingimg = '';
    }

    function prepareFile(data) {
        var bufferReader = new FileReader();
        bufferReader.onload = function() {
            pendingimg = this.result;
        };
        bufferReader.readAsArrayBuffer(data);

        var dataUrlreader = new FileReader();
        dataUrlreader.onload = function() {
            showPendingImg(this.result);
        };
        dataUrlreader.readAsDataURL(data);
    }

    function bufferToBase64(buf) {
        var binstr = Array.prototype.map.call(buf, function(ch) {
            return String.fromCharCode(ch);
        }).join('');
        return btoa(binstr);
    }

    $(attachinput).change(function() {
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