// server.js
// where your node app starts

// Init project
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var database = require('better-sqlite3');

// Init SQL
var db = new database('queue.db');
db.prepare('CREATE TABLE IF NOT EXISTS main (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, LOC TEXT);').run();
//db.prepare('SELECT * FROM main').run();

//var sqlite3 = require('sqlite3').verbose();
//var db = new sqlite3.Database('theQueue.db');
//db.run('CREATE TABLE IF NOT EXISTS main (ROOM TEXT, NAME TEXT, LOC TEXT);');



app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

app.get('/tutor', function(req, res){
  res.sendFile(__dirname + '/views/tutor.html');
});

app.get('/tutorView', function(req, res){
  res.sendFile(__dirname + '/views/tutorView.html');
});

app.get('/screen', function(req, res){
  res.sendFile(__dirname + '/views/screen.html');
});

app.get('/screenView', function(req, res){
  res.sendFile(__dirname + '/views/screenView.html');
});

app.get('/clear', function(req, res){
  res.sendFile(__dirname + '/views/clear.html');
});

app.get('/cleared', function(req, res){
  clearQueue(req.query.roomKey.substring(0,30));
  res.sendFile(__dirname + '/views/cleared.html');
});

app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/public/style.css');
});

app.get('/screenView.js', function(req, res){
  res.sendFile(__dirname + '/public/screenView.js');
});

app.get('/tutorView.js', function(req, res){
  res.sendFile(__dirname + '/public/tutorView.js');
});

app.get('/submit.html', function(req, res){
  res.sendFile(__dirname + '/views/submit.html');
  var roomKey = 'q' + req.query.roomKey.substring(0,30);
  db.prepare('CREATE TABLE IF NOT EXISTS ' + roomKey + ' (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, LOC TEXT);').run();
  db.prepare('INSERT INTO ' + roomKey + ' (NAME, LOC) VALUES (?, ?);').run(encodeURIComponent(req.query.stdname.substring(0,30)), encodeURIComponent(req.query.compNum.substring(0,10)));
  
  printQueue(roomKey);
  io.to(roomKey).emit('updateQueue', queue);
});

io.on('connection', function(socket){
  console.log('a tutor/screen connected: ' + socket.id);
  console.log('joined room: ' + socket.handshake.query['roomKey']);
  var roomKey = 'q' + socket.handshake.query['roomKey'].substring(0,30);
  socket.join(roomKey, () => {
    let rooms = Object.keys(socket.rooms);
    console.log(rooms);
  });
  
  db.prepare('CREATE TABLE IF NOT EXISTS ' + roomKey + ' (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, LOC TEXT);').run();
  queue = db.prepare('SELECT NAME, LOC, ROWID FROM ' + roomKey + ';').all();
  socket.emit('updateQueue', queue);
  
  socket.on('next', function(){
    db.prepare('DELETE FROM ' + roomKey + ' WHERE ROWID = (SELECT MIN(ROWID) FROM ' + roomKey + ');').run();
    printQueue(roomKey);
    io.to(roomKey).emit('updateQueue', queue);
  });
  
  socket.on('done', function(id) {
    console.log("removing " + id + " from " + roomKey);
    db.prepare('DELETE FROM ' + roomKey + ' WHERE ROWID = ' + id + ';').run();
    printQueue(roomKey);
    io.to(roomKey).emit('updateQueue', queue);
  });
});

// Node.js listen
var listener = http.listen(process.env.PORT, function(){
  console.log('Your app is listening on port ' + listener.address().port);
});

var queue = [];
var screenUsers = [];
var tutorUsers = [];

function printQueue(roomKey) {
  queue = db.prepare('SELECT NAME, LOC, ROWID FROM ' + roomKey + ';').all();
  
  console.log(roomKey + ' Queue:');
  var i = 0;
  for (i = 0; i < queue.length; i++) {
    queue[i]['ROWID'] = queue[i]['ROWID'].toString()
    console.log(queue[i]);
  }
  console.log()
}

function clearQueue(roomKey) {
  db.prepare('DROP TABLE ' + roomKey + ';').run();
  db.prepare('CREATE TABLE IF NOT EXISTS main (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, LOC TEXT);').run();
  console.log('Cleared ' + roomKey);
  queue = [];
  io.to(roomKey).emit('updateQueue', queue);
}

var resetter = setInterval(function () {
  var date = new Date();
  var currentHour = date.getHours();
  if (currentHour == 3) {
    clearAll();
  }
}, 3600000);

function clearAll() {
  var tables = db.prepare('SELECT name FROM sqlite_master WHERE type="table"').all();
  var i = 1;
  while (i < tables.length) {
    db.prepare('DROP TABLE ' + tables[i].name + ';').run();
    i++;
  }
  db.prepare('CREATE TABLE IF NOT EXISTS main (ROWID INTEGER PRIMARY KEY AUTOINCREMENT, NAME TEXT, LOC TEXT);').run();
}