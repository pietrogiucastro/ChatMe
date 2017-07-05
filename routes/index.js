var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var WebSocketServer = require('websocket').server;
var http = require('http');
var https = require('https');

var Config = require('../environment'),
conf = new Config();


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


process.title = 'node-chat';

var webSocketsServerPort = 1337;
var webSocketServer = require('websocket').server;
var http = require('http');

// latest 100 messages
var history = [ ];
// list of currently connected clients (users)
var clients = [ ];

//escape input string function
function htmlEntities(str) {
  return String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
//get user name function
function getUsername(url) {

	return url.slice(1);
}

var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

/**
 * HTTP server
 */
 var server = http.createServer(function(request, response) {
  // Not important for us. We're writing WebSocket server,
  // not HTTP server
});
 server.listen(webSocketsServerPort, function() {
  console.log((new Date()) + " Server is listening on port "
    + webSocketsServerPort);
});
/**
 * WebSocket server
 */
 var wsServer = new webSocketServer({
  // WebSocket server is tied to a HTTP server. WebSocket
  // request is just an enhanced HTTP request. For more info 
  // http://tools.ietf.org/html/rfc6455#page-6
  httpServer: server
});

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
  console.log((new Date()) + ' Connection from origin '
    + request.origin + '.');

  // accept connection - accept every origin since the client comes from any site
  var connection = request.accept(null, request.origin); 

  // we need to know client index to remove them on 'close' event
  var index = clients.push(connection) - 1;
  var username = getUsername(request.httpRequest.url);
  console.log((new Date()) + ' User is known as: ' + username);

  console.log((new Date()) + ' Connection accepted.');
  // send back chat history
  connection.sendUTF(
    JSON.stringify({type: 'history', data: history} ));
  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') { // accept only text
	    // first message sent by user is their name

	    console.log((new Date()) + ' Received Message from '
         + username + ': ' + message.utf8Data);
	    
	    // we want to keep history of all sent messages
	    var obj = {
         time: (new Date()).getTime(),
         text: htmlEntities(message.utf8Data),
         author: username
     };
     history.push(obj);
     history = history.slice(-100);

	    // broadcast message to all connected clients
	    var json = JSON.stringify({ type: 'message', data: obj });
	    for (var i=0; i < clients.length; i++) {
         clients[i].sendUTF(json);
     }
 }
});
  // user disconnected
  connection.on('close', function(connection) {
    if (username !== false) {
      console.log((new Date()) + " Peer "
        + connection.remoteAddress + " disconnected.");
      // remove user from the list of connected clients
      clients.splice(index, 1);
  }
});
});

router.get('/', function(req, res, next) {
  res.render('index', {title: 'chat.me'});
});

router.get('/client/:version', function(req, res, next) {
	var version = req.params.version;

	res.render('clients/'+version);
});


module.exports = router;
