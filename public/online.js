let canvas
let ctx

let timerId

const Routes = { 
  UP: 'up', 
  DOWN: 'down', 
  RIGHT: 'right', 
  LEFT: 'left'
}
const keyMap = { 
  ArrowUp: Routes.UP, 
  ArrowDown: Routes.DOWN, 
  ArrowRight: Routes.RIGHT, 
  ArrowLeft: Routes.LEFT
}

// for animation:
let animate
let r
let dir = 1
//

let game
let stepGame
let snakeId

const socket = io('http://localhost:3000')

socket.on('connect', function() {
  console.log('Connected to server')
})

socket.on('stream', function (data) {
  game = data.data
  stepGame = data.step
  console.log('Game получен', game.status)
  if (game.status === 'finished') {
    setTimeout(() => {
      showBlock('body-game')
      hideBlock('gameplay')
      hideBlock('waiting')
    }, 5000)
  }
  document.getElementById('score').innerText = game.snakes[findSnakeWithId(snakeId)].level
  document.getElementById('textOnPause').innerText = game.status === 'paused' ? 'Resume' : 'Pause'
})

socket.on('disconnect', function () {
  console.error('lost connection')
})


function pause () {
  if (game.status === 'playing') {
    socket.emit('paused')
  } else if (game.status === 'paused') {
    socket.emit('resumed')
  }
}

function newGame () {
  socket.emit('startNewGame')
  socket.on('invite', function (data) {
    game = data.data
    stepGame = data.step
    snakeId = data.id
    console.log(data)
    console.log('invite получен', game.status)
    document.getElementById('score').innerText = game.snakes[findSnakeWithId(snakeId)].level
    document.getElementById('textOnPause').innerText = game.status === 'paused' ? 'Resume' : 'Pause'
    hideBlock('waiting')
    showBlock('gameplay')
    startNewGame()
  })
  showBlock('waiting')
  hideBlock('gameplay')
  hideBlock('body-game')
}

function showBlock (selector) {
  document.getElementById(selector).style.display = "block"
}

function hideBlock (selector) {
  document.getElementById(selector).style.display = "none"
}

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  document.addEventListener('keydown', setNextRoute)
  document.getElementById('pause').addEventListener('click', pause)
  document.getElementById('newGame').addEventListener('click', newGame)
  document.getElementById('connectToGame').addEventListener('click', connectToGame)
  document.getElementById('restart').addEventListener('click', newGame)
  document.getElementById('exit').addEventListener('click', exit)
}

function connectToGame () {
  console.log('Connect to game')
  socket.on('invite', function (data) {
    game = data.data
    stepGame = data.step
    snakeId = data.id
    console.log(data)
    console.log('invite получен', game.status)
    document.getElementById('score').innerText = game.snakes[findSnakeWithId(snakeId)].level
    document.getElementById('textOnPause').innerText = game.status === 'paused' ? 'Resume' : 'Pause'
    hideBlock('waiting')
    showBlock('gameplay')
    startNewGame()
  })
  socket.emit('requestInvite')
  hideBlock('body-game')
  showBlock('waiting')
}

function exit () {
  console.log('exit')
  socket.emit('exit')
  showBlock('body-game')
  hideBlock('gameplay')
}

function startNewGame () {
  cancelAnimationFrame(animate)
  clearScreen()
  canvas.width = game.width
  canvas.height = game.height
  r = (stepGame / 2) * 10
  draw()
}

function playGame () {
  // console.log(snake.positionHead)
  // console.log(...snake.positionBody)
  
  //socket.emit('game', game)
}

function setNextRoute (event) {
  if ( ! (event.key in keyMap)) {
    return
  }
  let requestedRoute = keyMap[event.key]
  if (requestedRoute === Routes.UP && game.snakes[findSnakeWithId(snakeId)].route === Routes.DOWN) {
    return
  }
  if (requestedRoute === Routes.DOWN && game.snakes[findSnakeWithId(snakeId)].route === Routes.UP) {
    return
  }
  if (requestedRoute === Routes.RIGHT && game.snakes[findSnakeWithId(snakeId)].route === Routes.LEFT) {
    return
  }
  if (requestedRoute === Routes.LEFT && game.snakes[findSnakeWithId(snakeId)].route === Routes.RIGHT) {
    return
  }
  if (game.status === 'playing') socket.emit('setRoute', {requestedRoute, snakeId})
}

function findSnakeWithId (id) {
  return game.snakes.findIndex((snake) => {
    return snake.id === id ? true : false
  })
}

function draw () {
  clearScreen()
  game.snakes.forEach((snake) => {
    drawFood()
    drawBody(snake)
    drawHead(snake)
  })
  animate = requestAnimationFrame(draw)
}

function drawHead (snake) {
  ctx.beginPath()
  ctx.fillStyle = game.status === 'finished' ? '#D73333' : '#366A5D'
  ctx.fillRect(
    snake.positionHead.x, 
    snake.positionHead.y, 
    stepGame, 
    stepGame
  )
  ctx.closePath()
  // console.log(snake.positionHead.x, snake.positionBody[snake.positionBody.length - 1].x)
}

function drawBody (snake) {
  if (snake.positionBody.length >= 1) {
    for (let i = 0; i < snake.positionBody.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = '#63A794'
      ctx.fillRect(
        snake.positionBody[i].x, 
        snake.positionBody[i].y, 
        stepGame, 
        stepGame
      )
      ctx.closePath()
    }
  } 
}

function drawFood () {
  r += dir
  if (r === (stepGame / 2) * 10 + 15 || r === (stepGame / 2) * 10 - 30) dir *= -1
  ctx.beginPath()
  ctx.fillStyle = game.food.color
  ctx.arc(
    game.food.position.x + (stepGame / 2), 
    game.food.position.y + (stepGame / 2), 
    r / 10, 
    0, 
    Math.PI*2
  )
  ctx.closePath()
  ctx.fill()
}

function clearScreen () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}