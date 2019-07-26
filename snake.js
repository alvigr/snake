const EventEmitter = require('events')

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
  step: 20,
  speed: 200,
  nextRoute: '',
  snake: {
    level: 5,
    positionHead: {
      x: -20,
      y: 0
    },
    positionBody: [{
      x: -40,
      y: 0
    }],
    route: 'right'
  },
  food: {
    position: {
      x: 100,
      y: 100
    },
    color: '',
  },
  colorsSet: [
    'FireBrick', 
    'MediumVioletRed', 
    'OrangeRed', 
    'Violet', 
    'Purple', 
    'Indigo',
    'Chocolate',
    'Brown'
  ],
  width: 300,
  height: 300
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

function startNewGame () {
  console.log('Start new game')
  clearInterval(timerId)
  game.speed = 200
  game.snake.positionHead.x = game.step * (-1)
  game.snake.positionHead.y = 0
  game.snake.level = 5
  game.snake.positionBody = [
    {
      x: game.step * (-3),
      y: 0
    },
    {
    x: game.step * (-2),
    y: 0
  }],
  game.nextRoute = 'right'
  game.snake.route = 'right'
  setFood()
  timerId = setInterval(playGame, game.speed)
  changeStatus(Statuses.PLAYING)
}

function playGame () {
  finishGame()
  setRoute()
  moveTail()
  moveHead()
  eatFood()
  checkPlay()
  moveBody()
  // console.log(game.snake.positionHead)
  // console.log(...game.snake.positionBody)

  emitter.emit('game', game)
}

function setNextRoute (requestedRoute) {
  if (requestedRoute === Routes.UP && game.snake.route === Routes.DOWN) {
    return
  }
  if (requestedRoute === Routes.DOWN && game.snake.route === Routes.UP) {
    return
  }
  if (requestedRoute === Routes.RIGHT && game.snake.route === Routes.LEFT) {
    return
  }
  if (requestedRoute === Routes.LEFT && game.snake.route === Routes.RIGHT) {
    return
  }
  if (game.status === Statuses.PLAYING) game.nextRoute = requestedRoute
}

function setRoute () {
  game.snake.route = game.nextRoute  
}

function moveHead () {
  if (game.snake.route === 'right') {
    game.snake.positionHead.x += game.step
    if (game.snake.positionHead.x >= game.width) {
      game.snake.positionHead.x = 0
    }
  }
  if (game.snake.route === 'left') {
    game.snake.positionHead.x -= game.step
    if (game.snake.positionHead.x < 0) {
      game.snake.positionHead.x = game.width - game.step
    }
  }
  if (game.snake.route === 'up') {
    game.snake.positionHead.y -= game.step
    if (game.snake.positionHead.y < 0) {
      game.snake.positionHead.y = game.height - game.step
    }
  }
  if (game.snake.route === 'down') {
    game.snake.positionHead.y += game.step
    if (game.snake.positionHead.y >= game.height) {
      game.snake.positionHead.y = 0
    }
  }
}

function randomInteger (min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}

function setFood () {
  let posForFood = {
    x: randomInteger(0, (game.width - game.step) / game.step) * game.step, 
    y: randomInteger(0, (game.height - game.step) / game.step) * game.step
  }
  if (
    game.snake.positionBody.findIndex(function (element) {
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
    setFood()
  }
  game.food.color = game.colorsSet[
    randomInteger(0, game.colorsSet.length - 1)
  ]
}

function eatFood () {
  if (
    game.snake.positionHead.x === game.food.position.x &
    game.snake.positionHead.y === game.food.position.y
    ) {
    game.snake.level++
    setFood()
  }
}

function checkPlay () {
  if (game.snake.positionBody.find(
    function (element) {
      if (
        element.x === game.snake.positionHead.x
        && element.y === game.snake.positionHead.y
        ) {
        return true
      }
    }
  )) {
    changeStatus(Statuses.FINISHED)
  }
}

function finishGame () {
  if (game.status === Statuses.FINISHED) {
    clearInterval(timerId)
  }
}

function moveBody () {
  game.snake.positionBody.push({
    x: game.snake.positionHead.x, 
    y: game.snake.positionHead.y
  })
  x = game.snake.positionBody[game.snake.positionBody.length - 2].x
  y = game.snake.positionBody[game.snake.positionBody.length - 2].y
}

function moveTail () {
  while (game.snake.positionBody.length >= game.snake.level) {
    game.snake.positionBody.shift()
  }
}

module.exports = {
  newGame,
  getState,
  pauseOrResume,
  setNextRoute,
  on,
  off
}