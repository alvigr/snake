const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const game = require('./game')


app.use(express.static('public'));

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/online.html');
});

function onChangeGame (data) {
  //console.log('game')
  emitStateAll('stream')
}

game.on('game', onChangeGame)

function getState (client) {
  let id = activeClients.filter(obj => obj.client === client)[0].id
  return {data: game.getState(), gameField: game.getField(), id}
}

function emitStateAll (event) {
  activeClients.forEach((activeClient) => {
    activeClient.client.emit(event, getState(activeClient.client))
  })
}

let activeClients = []

const waitingInvite = []

io.on('connection', client => {
  console.log('a user connected');
  client.on('exit', () => {
    game.setDefaultParams()
    game.resetGame()
  })
  client.on('startNewGame', () => {
    console.log('Start new game to client')
   
    game.setDefaultParams()
    game.resetGame()
    let id = game.addSnake()
    activeClients.push({id, client})
    client.emit('invite', getState(client))
    game.newGame()
  })
  client.on('setRoute', newRoute => {
    console.log('New route', newRoute.requestedRoute)
    game.setNextRoute(newRoute.requestedRoute, newRoute.snakeId)
  })
  client.on('paused', () => {
    game.pauseOrResume()
    console.log('Game paused to client')
    emitStateAll('stream')
  })
  client.on('resumed', () => {
    game.pauseOrResume()
    console.log('Game resumed to client')
    emitStateAll('stream')
  })
  client.on('requestInvite', () => {
    console.log('request Invite')
    waitingInvite.push(client)
    if (waitingInvite.length === 2) {
      game.setDefaultParams()
      game.resetGame()

      while (waitingInvite.length > 0) {
        let waiting = waitingInvite.pop()
        let id = game.addSnake()
        waiting.emit('invite', getState(waiting))
        console.log('Send invite', id)
      }
      game.newGame()
    }
  })
  // client.on('event', data => { 
  //   console.log('event', data)
  //  });
  client.on('disconnect', () => { 
    console.log('user closed connection')
    activeClients = activeClients.filter(obj => obj.client !== client)
    game.resetGame()
   });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});