$(function() { 
  $(uploadinput).change(function(e) {
    var file = e.target.files[0];
    var stream = ss.createStream();

    // upload a file to the server. 
    ss(socket).emit('file', stream, {size: file.size});
    return;
    var blobStream = ss.createBlobReadStream(file).pipe(stream);

    var size = 0;
 
    blobStream.on('data', function(bytes) {
    	size += bytes.length;
    	console.log(Math.floor(size / file.size * 100) + '%');
	});
    blobStream.pipe(stream);
  });
});