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

function onChangeGame (game) {
  //console.log('game')
  io.emit('stream', game)
}

snake.on('game', onChangeGame)

const waitingInvite = []

io.on('connection', client => {
  console.log('a user connected');
  client.on('exit', () => {
    snake.setDefaultParams()
    snake.resetGame()
  })
  client.on('startNewGame', () => {
    console.log('Start new game to client')
   
    snake.setDefaultParams()
    snake.resetGame()
    let id = snake.addSnake()
    client.emit('invite', {data: snake.getState(), step: snake.stepGame, id})
    snake.newGame()
  })
  client.on('setRoute', newRoute => {
    console.log('New route')
    snake.setNextRoute(newRoute.requestedRoute, newRoute.snakeId)
  })
  client.on('paused', () => {
    snake.pauseOrResume()
    console.log('Game paused to client')
    io.emit('stream', {data: snake.getState(), step: snake.stepGame})
  })
  client.on('resumed', () => {
    snake.pauseOrResume()
    console.log('Game resumed to client')
    io.emit('stream', {data: snake.getState(), step: snake.stepGame})
  })
  client.on('requestInvite', () => {
    console.log('request Invite')
    waitingInvite.push(client)
    if (waitingInvite.length === 2) {
      snake.setDefaultParams()
      snake.resetGame()

      while (waitingInvite.length > 0) {
        let waiting = waitingInvite.pop()
        let id = snake.addSnake()
        waiting.emit('invite', {data: snake.getState(), step: snake.stepGame, id})
        console.log('Send invite', id)
      }
      snake.newGame()
    }
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