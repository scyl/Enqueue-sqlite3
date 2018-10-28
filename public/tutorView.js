// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  var urlParams = new URLSearchParams(window.location.search);
  var roomKey = urlParams.get('roomKey').substring(0,30);
  //console.log(roomKey);
  var socket = io('', {query: 'roomKey=' + roomKey});
  
  socket.on('updateQueue', function(queue){
    $('#queue').html("");
    if (queue.length  > 0) {
      var i = 0;
      for (i = 0; i < queue.length; i++) {
        $('#queue').append($('<li class="queue">').html(genRoll(queue[i])));
      }
    } else {
      $('#queue').html("EMPTY");
    }
  });
  
  $("#btn").on('click', '.nextBtn', function() {
    socket.emit('next');
    console.log("Next clicked");
  });
  
  $("#queue").on('click', 'button.done', function() {
    socket.emit('done', this.id);
    console.log("Done clicked for " + this.id);
});
  
});


function genRoll(user) {
  return "<table><tr class='nameRow'><th class='name'>" + user['NAME'] + "</th><th class='name'>" + user['LOC'] + "</th><th class='done'><button class='done' id='" + user['ROWID'] + "'>Done</button></th></tr></table>";
}