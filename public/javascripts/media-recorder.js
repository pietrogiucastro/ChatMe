var Recorder = {
    constraints: { audio: true },
    chunkstime: 1000,
    elapsedtime: 0,
    timeInterval: undefined,
    isrecording: false,
    record: function() {
        socket.emit('recording', true);
        this.isrecording = true;
        recorder.elapsedtime = 0;
        var mediaRecorder;
        navigator.mediaDevices.getUserMedia(recorder.constraints).then(function(mediaStream) {
            mediaRecorder = new MediaRecorder(mediaStream);
            mediaRecorder.onstart = function(e) {
                this.chunks = [];
            };
            mediaRecorder.ondataavailable = function(e) {
                this.chunks.push(e.data);
                //recorder.elapsedtime += recorder.chunkstime;
                //mictime.html(recorder.getTimeByMs(recorder.elapsedtime));
            };
            recorder.timeInterval = setInterval(function() {
                recorder.elapsedtime += recorder.chunkstime;
                if (recorder.elapsedtime >= 120100) {
                    recorder.elapsedtime = 120100;
                    mediaRecorder.pause();
                }
                mictime.html(recorder.getTimeByMs(recorder.elapsedtime));
            }, recorder.chunkstime);
            mediaRecorder.onstop = function(e) {
                var blob = new Blob(this.chunks, { 'type' : 'audio/ogg; codecs=opus' });
                socket.emit('send media', {type: 'audio', buffer: blob, duration: recorder.elapsedtime});
                mediaRecorder.delete();
            };
            mediaRecorder.delete = function() {
                mediaStream.getTracks().forEach( track => track.stop() ); // stop each track from the MediaStream
                mediaRecorder = undefined;
                clearInterval(recorder.timeInterval);
                socket.emit('recording', false);
                this.isrecording = false;
            };
            recorder.stopAndSendRecord = function() {
                if (mediaRecorder)
                    mediaRecorder.stop();
            };
            recorder.cancelRecord = function() {
                if (mediaRecorder)
                    mediaRecorder.delete();
            };

            mediaRecorder.start(recorder.chunkstime);
        });
    },
    getTimeByMs: function(duration) {
        var seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return (parseInt(hours) ? hours + ":" : '') + minutes + ":" + seconds;
    }
},

recorder = new (function() {return Recorder})();