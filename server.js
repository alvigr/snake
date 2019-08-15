const express = require('express')
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const createGame = require('./game')

const Modes = {
  SINGLE: 'single',
  MULTI: 'multi'
}

const waitingInvite = []

let sessions = []

app.use(express.static('public'));

app.get('/', (req, res) => {
  //res.send('<h1>Hello world</h1>');
  res.sendFile(__dirname + '/online.html');
});

io.on('connection', client => {
  console.log('a user connected', client.id);
  client.on('exit', () => {
    getGame(client).shutdown()
    sessions = sessions.filter(obj => obj.client !== client)
  })
  client.on('setRoute', newRoute => {
    console.log('New route', newRoute.requestedRoute)
    getGame(client).setNextRoute(newRoute.requestedRoute, newRoute.snakeId)
  })
  client.on('paused', () => {
    getGame(client).pauseOrResume()
    console.log('Game paused to client')
    emitStateAll('stream', getGame(client))
  })
  client.on('resumed', () => {
    getGame(client).pauseOrResume()
    console.log('Game resumed to client')
    emitStateAll('stream', getGame(client))
  })
  client.on('requestInvite', options => {
    console.log('request Invite')
    if (options.mode === Modes.SINGLE) {
      const game = createGame()
      addPlayer(game, client)
      game.startNewGame()
    } else {
      waitingInvite.push(client)
      if (waitingInvite.length === 2) {
        const game = createGame()
        while (waitingInvite.length > 0) {
          let waiting = waitingInvite.pop()
          addPlayer(game, waiting)
        }
        game.startNewGame()
      }
    }
  })
  client.on('finished', () => {
    console.log('Finish Game')
    sessions = sessions.filter(obj => obj.client !== client)
  })
  client.on('disconnect', () => { 
    console.log('user closed connection')
    if (hasSession(client)) {
      getGame(client).shutdown()
      sessions = sessions.filter(obj => obj.client !== client)
    }
   })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});

function addPlayer (game, player) {
  let id = game.addSnake()
  sessions.push({id, client: player, game})
  game.on('game', () => {
    player.emit('stream', getState(player))
  })
  player.emit('invite', getState(player))
  console.log('Send invite', id)
}

function getSession (client) {
  const session = sessions.filter(session => session.client === client)[0]
  if (session === undefined) {
    throw new Error(`Не найдена сессия для клиента ${client.id}`)
  }
  return session
}

function hasSession (client) {
  return sessions.filter(session => session.client === client).length === 1
}

function getGame (client) {
  return getSession(client).game
} 

function getState (client) {
  const session = getSession(client)
  const game = session.game
  return {data: game.getState(), gameArea: game.getArea(), id: session.id}
}

function emitStateAll (event, game) {
  sessions.filter(session => session.game === game).forEach((session) => {
    session.client.emit(event, getState(session.client))
  })
}