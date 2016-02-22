var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(process.env.PORT || 3003);

app.get('/driveparam', function (req, res) {
  res.sendfile(__dirname + '/Fusion360/driveparam/index.html');
});

io.on('connection', function(socket){
  socket.on('fusion360', function(msg){	 
    console.log('message: ' + msg.user +' ' + msg.newv);
	//convert string to number
    var recievedV = msg.newv * 1.0;
    //io.emit('aaa', recievedV);
	//emit the value to listener
    io.emit(msg.user, recievedV);
  });
  console.log('connected');
});