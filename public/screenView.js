// client-side js
// run by the browser each time your view template is loaded

$(function() {
  var urlParams = new URLSearchParams(window.location.search);
  var roomKey = urlParams.get('roomKey').substring(0,30);
  //console.log(roomKey);
  var socket = io('', {query: 'roomKey=' + roomKey});
  
  $('#instruction').html("Fill in the form with <font color='#d84b4b'>Room Key = " + roomKey + "</font>");
  
  socket.on('updateQueue', function(queue){
    $('#queue').html("");
    if (queue.length  > 0) {
      var i = 0;
      for (i = 0; i < queue.length; i++) {
        $('#queue').append($('<li class="scrqueue">').html(genRoll(queue[i])));
      }
    } else {
      $('#queue').html("EMPTY");
    }
  });
});

function genRoll(user) {
  return "<table><tr class='nameRow'><th class='names'>" + user['NAME'] + "</th><th class='name'>" + user['LOC']  + "</th></tr></table>";
}