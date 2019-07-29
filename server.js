const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const snake = require('./snake')


snake.on('game', (game) => {
  //console.log(game.status, game.snake.positionHead)
})

app.use(express.static('public'));

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/online.html');
});

app.get('/stream', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/stream.html');
});

function onChangeGame (game) {
  //console.log('game')
  io.emit('stream', game)
}

snake.on('game', onChangeGame)

io.on('connection', client => {
  console.log('a user connected');
  client.on('wait', () => {
    snake.setDefaultParams()
    io.emit('stream', {data: snake.getState(), step: snake.stepGame})
  })
  client.on('startNewGame', () => {
    console.log('Start new game to client')
    snake.newGame()
  })
  client.on('setRoute', newRoute => {
    console.log('New route')
    snake.setNextRoute(newRoute)
  })
  client.on('paused', () => {
    snake.pauseOrResume()
    console.log('Game paused to client')
  })
  client.on('resumed', () => {
    snake.pauseOrResume()
    console.log('Game resumed to client')
  })
  // client.on('event', data => { 
  //   console.log('event', data)
  //  });
  client.on('disconnect', () => { 
    console.log('user closed connection')
    snake.resetGame()
   });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});