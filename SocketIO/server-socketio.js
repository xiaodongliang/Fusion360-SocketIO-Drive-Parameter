var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);



//app.use('/', express.static(__dirname + '/'));

app.get('/', function(req, res){
  res.sendfile('index-socketio.html');
});


io.on('connection', function(socket){
  socket.on('aaa', function(msg){
    console.log('message: ' + msg);
    io.emit('aaa', msg);
  });
  console.log('message: ');
});

app.set('port', 3002 );

http.listen(3002, function(){
  console.log('listening on *:5050');
});

//app.set('port', 3001 );
//
//var server = app.listen(app.get('port'), function() {
//  console.log('Server listening on port ' + server.address().port);
//});
