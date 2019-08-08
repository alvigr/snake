const EventEmitter = require('events')
const gameField = {
  width: 800,
  height: 600,
  step: 20,
}

let timerId

const Routes = { 
  UP: 'up', 
  DOWN: 'down', 
  RIGHT: 'right', 
  LEFT: 'left'
}

const Statuses = {
  WAIT: 'wait',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished'
}

let game = {
  status: Statuses.WAIT,
  speed: 170,
  snakes: [],
  food: {
    position: {
      x: 100,
      y: 100
    },
    color: '',
  },
  colorsSet: [
    '#EB5757', 
    '#9B51E0', 
    '#2F80ED', 
    '#F2C94C', 
    '#F2994A',
    '#56CCF2',
    '#D96BBA'
  ],
}

let emitter = new EventEmitter()

function on (eventName, listener) {
  emitter.on(eventName, listener)
}

function off (eventName, listener) {
  emitter.off(eventName, listener)
}

function changeStatus (status) {
  game.status = status
}

function getState () {
  return game
}

function getField () {
  return gameField
}

function pauseOrResume () {
  if (game.status === Statuses.PLAYING) {
    console.log('Game paused')
    clearInterval(timerId)
    changeStatus(Statuses.PAUSED)
  } else if (game.status === Statuses.PAUSED) {
    console.log('Game resumed')
    timerId = setInterval(playGame, game.speed)
    changeStatus(Statuses.PLAYING)
  }
}

function newGame () {
  startNewGame()
}

function addSnake () {
  let id = generateId()
  if (game.snakes.length === 0) {
    game.snakes.push({
      id,
      level: 5,
      positionHead: {
        x: gameField.step * (-1),
        y: 0
      },
      positionBody: [
        {
          x: gameField.step * (-3),
          y: 0
        },
        {
        x: gameField.step * (-2),
        y: 0
      }],
      nextRoute: 'right',
      route: 'right'
    })
  } else {
    game.snakes.push({
      id,
      level: 5,
      positionHead: {
        x: gameField.step * (-1),
        y: gameField.step
      },
      positionBody: [
        {
          x: gameField.step * (-3),
          y: gameField.step
        },
        {
        x: gameField.step * (-2),
        y: gameField.step
      }],
      nextRoute: 'left',
      route: 'left'
    })
  }
  return id
}

function findSnakeWithId (id) {
  return game.snakes.findIndex(snake => snake.id === id)
}

function setDefaultParams () {
  game.snakes = []
  game.speed = 200
}

function startNewGame () {
  console.log('Start new game')
  setFood(game.snakes[0])
  timerId = setInterval(playGame, game.speed)
  changeStatus(Statuses.PLAYING)
  emitter.emit('game', {data: game, step: gameField.step})
}

function resetGame () {
  console.log('Reset game')
  clearInterval(timerId)
  setDefaultParams()
  changeStatus(Statuses.WAIT)
}

function playGame () {
  if (finishGame()) {
    game.snakes.forEach((snake) => {
      setRoute(snake)
      moveTail(snake)
      moveHead(snake)
      eatFood(snake)
      checkPlay(snake)
      moveBody(snake)
    })
  }
  emitter.emit('game', {data: game, step: gameField.step})
}

function setNextRoute (requestedRoute, id) {
  let snake = game.snakes[findSnakeWithId(id)]
  if (requestedRoute === Routes.UP && snake.route === Routes.DOWN) {
    return
  }
  if (requestedRoute === Routes.DOWN && snake.route === Routes.UP) {
    return
  }
  if (requestedRoute === Routes.RIGHT && snake.route === Routes.LEFT) {
    return
  }
  if (requestedRoute === Routes.LEFT && snake.route === Routes.RIGHT) {
    return
  }
  if (game.status === Statuses.PLAYING) snake.nextRoute = requestedRoute
}

function setRoute (snake) {
  snake.route = snake.nextRoute
}

function moveHead (snake) {
  if (snake.route === 'right') {
    snake.positionHead.x += gameField.step
    if (snake.positionHead.x >= gameField.width) {
      snake.positionHead.x = 0
    }
  }
  if (snake.route === 'left') {
    snake.positionHead.x -= gameField.step
    if (snake.positionHead.x < 0) {
      snake.positionHead.x = gameField.width - gameField.step
    }
  }
  if (snake.route === 'up') {
    snake.positionHead.y -= gameField.step
    if (snake.positionHead.y < 0) {
      snake.positionHead.y = gameField.height - gameField.step
    }
  }
  if (snake.route === 'down') {
    snake.positionHead.y += gameField.step
    if (snake.positionHead.y >= gameField.height) {
      snake.positionHead.y = 0
    }
  }
}

function randomInteger (min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}

function generateId () {
  const symbols = 'qwertyuiopasdfghjklzxcvbnm1234567890'
  let id = ''
  for (let i = 0; i < 6; i++) {
    id += symbols[randomInteger(0, symbols.length - 1)]
  }
  return id
}

function setFood (snake) {
  let posForFood = {
    x: randomInteger(0, (gameField.width - gameField.step) / gameField.step) * gameField.step, 
    y: randomInteger(0, (gameField.height - gameField.step) / gameField.step) * gameField.step
  }
  if (
    snake.positionBody.findIndex(function (element) {
      if (element.x === posForFood.x && element.y === posForFood.y) {
        return true
      }
    }) === -1
    && posForFood.x !== game.food.position.x
    && posForFood.y !== game.food.position.y
    ) {
    game.food.position.x = posForFood.x
    game.food.position.y = posForFood.y
  } else {
    setFood(snake)
  }
  game.food.color = game.colorsSet[
    randomInteger(0, game.colorsSet.length - 1)
  ]
}

function eatFood (snake) {
  if (
    snake.positionHead.x === game.food.position.x &
    snake.positionHead.y === game.food.position.y
    ) {
    snake.level++
    setFood(snake)
  }
}

function checkPlay (snake) {
  game.snakes.forEach((bodysSnakes) => {
    if (bodysSnakes.positionBody.find(
      function (element) {
        if (
          element.x === snake.positionHead.x
          && element.y === snake.positionHead.y
          ) {
          return true
        }
      }
    )) {
      changeStatus(Statuses.FINISHED)
    }
  })
}

function finishGame () {
  if (game.status === Statuses.FINISHED) {
    clearInterval(timerId)
    return false
  } else {
    return true
  }
}

function moveBody (snake) {
  snake.positionBody.push({
    x: snake.positionHead.x, 
    y: snake.positionHead.y
  })
  x = snake.positionBody[snake.positionBody.length - 2].x
  y = snake.positionBody[snake.positionBody.length - 2].y
}

function moveTail (snake) {
  while (snake.positionBody.length >= snake.level) {
    snake.positionBody.shift()
  }
}

module.exports = {
  setDefaultParams,
  resetGame,
  newGame,
  addSnake,
  getState,
  getField,
  pauseOrResume,
  setNextRoute,
  on,
  off
}