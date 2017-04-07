$ (function() {
  var socket = io();
  var canvas = document.getElementById('the-canvas');
  var ctx = canvas.getContext('2d');
  var drawing = false;
  var lastMousePosition = {};
  var lineColor = 'lightgreen';



  $('.color-picker').on('change', function() {

    lineColor = $('.color-picker').val();
    lastMousePosition.newColor = $('.color-picker').val();
    console.log(lastMousePosition.newColor);
  });

  $('canvas').on('mousedown', function eventHandler(event) {
    drawing = true;

  });

  $('canvas').on('mousemove', function eventHandler(event) {
    // do stuff in response to mouse being clicked down
    var mouseposition = {
      x: event.clientX,
      y: event.clientY
    };

    console.log('last: ', lastMousePosition, 'current: ', mouseposition);

    if (drawing) {
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.moveTo(lastMousePosition.x, lastMousePosition.y);
      ctx.lineTo(mouseposition.x, mouseposition.y);
      ctx.closePath();
      ctx.stroke();
      socket.emit('position', mouseposition, lastMousePosition);
      console.log(lastMousePosition.newColor, 'THIS IS IT!');
    }
    lastMousePosition = mouseposition;
  });

  $('canvas').on('mouseup', function eventHandler(event) {
    drawing = false;

  });

  socket.on('draw', function(mouseposition, lastMousePosition) {
    ctx.beginPath();
    ctx.fillStyle = lastMousePosition.newColor;
    console.log(lastMousePosition.newColor);
    ctx.moveTo(lastMousePosition.x, lastMousePosition.y);
    ctx.lineTo(mouseposition.x, mouseposition.y);
    ctx.closePath();
    ctx.stroke();
  });
});
