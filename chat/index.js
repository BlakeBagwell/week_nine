var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, resp){
  resp.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.broadcast.emit('join', 'a user has connected');
  socket.on('disconnect', function(){
    console.log('user has disconnected');
  });
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

io.emit('some event', { for: 'everyone' });


http.listen(3000, function(){
  console.log('listening on *:3000');
});
