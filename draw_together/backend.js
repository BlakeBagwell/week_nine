const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', function(socket) {
  console.log('user connected');

  socket.on('position', function(mouseposition, lastMousePosition) {
    console.log(mouseposition.x, mouseposition.y);
    console.log('server color', lastMousePosition.newColor);
    socket.broadcast.emit("draw", mouseposition, lastMousePosition);
  });


});




http.listen('8000', function() {
  console.log('Listening on port 8000!');
});
