const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/online.html');
});

app.get('/stream', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/stream.html');
});


io.on('connection', client => {
  console.log('a user connected');
  client.on('game', data => {
    console.log('game')
    io.emit('stream', data)
   });
  // client.on('event', data => { 
  //   console.log('event', data)
  //  });
  client.on('disconnect', () => { 
    console.log('user closed connection')
   });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});