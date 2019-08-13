const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const game = require('./game')

const Modes = {
  SINGLE: 'single',
  MULTI: 'multi'
}

const waitingInvite = []

let activeClients = []

game.on('game', onChangeGame)

app.use(express.static('public'));

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/online.html');
});

io.on('connection', client => {
  console.log('a user connected');
  client.on('exit', () => {
    game.resetGame()
    activeClients = activeClients.filter(obj => obj.client !== client)
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
  client.on('requestInvite', options => {
    console.log('request Invite')
    if (options.mode === Modes.SINGLE) {
      game.resetGame()
      addPlayer(client)
      game.startNewGame()
    } else {
      waitingInvite.push(client)
      if (waitingInvite.length === 2) {
        game.resetGame()
        while (waitingInvite.length > 0) {
          let waiting = waitingInvite.pop()
          addPlayer(waiting)
        }
        game.startNewGame()
      }
    }
  })
  client.on('finished', () => {
    console.log('Finish Game')
    activeClients = activeClients.filter(obj => obj.client !== client)
  })
  client.on('disconnect', () => { 
    console.log('user closed connection')
    activeClients = activeClients.filter(obj => obj.client !== client)
    game.resetGame()
   });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function addPlayer (player) {
  let id = game.addSnake()
  activeClients.push({id, client: player})
  player.emit('invite', getState(player))
  console.log('Send invite', id)
}

function onChangeGame () {
  emitStateAll('stream')
}

function getState (client) {
  let id = activeClients.filter(obj => obj.client === client)[0].id
  return {data: game.getState(), gameArea: game.getArea(), id}
}

function emitStateAll (event) {
  activeClients.forEach((activeClient) => {
    activeClient.client.emit(event, getState(activeClient.client))
  })
}