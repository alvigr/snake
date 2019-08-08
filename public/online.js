let canvas
let ctx

let timerId

const Routes = { 
  UP: 'up', 
  DOWN: 'down', 
  RIGHT: 'right', 
  LEFT: 'left'
}

const Modes = {
  SINGLE: 'single',
  MULTI: 'multi'
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
let gameArea
let snakeId

const socket = io('http://localhost:3000')

socket.on('connect', function() {
  console.log('Connected to server')
})

socket.on('stream', function (data) {
  console.log('stream', data.gameArea)
  game = data.data
  gameArea = data.gameArea
  console.log('Game получен', game.status)
  if (game.status === 'finished') {
    socket.emit('finished')
    setTimeout(() => {
      showBlock('menu')
      hideBlock('gameplay')
      hideBlock('waiting')
    }, 5000)
  }
  console.log(data.id, snakeId)
  document.getElementById('score').innerText = mySnake().level
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
  document.getElementById('singlePlayer').addEventListener('click', () => {connectToGame(Modes.SINGLE)})
  document.getElementById('multiPlayer').addEventListener('click', () => {connectToGame(Modes.MULTI)})
  //document.getElementById('restart').addEventListener('click', newGame)
  document.getElementById('exit').addEventListener('click', exit)
}

function connectToGame (mode) {
  console.log('Connect to game')
  socket.on('invite', function (data) {
    console.log('invite', data.gameArea)
    game = data.data
    gameArea = data.gameArea
    snakeId = data.id
    console.log(data)
    console.log('invite получен', game.status)
    document.getElementById('score').innerText = mySnake().level
    document.getElementById('textOnPause').innerText = game.status === 'paused' ? 'Resume' : 'Pause'
    hideBlock('waiting')
    showBlock('gameplay')
    startNewGame()
  })
  socket.emit('requestInvite', {mode})
  hideBlock('menu')
  showBlock('waiting')
}

function exit () {
  console.log('exit')
  socket.emit('exit')
  showBlock('menu')
  hideBlock('gameplay')
}

function startNewGame () {
  console.log('startNewGame')
  cancelAnimationFrame(animate)
  clearScreen()
  console.log(gameArea)
  canvas.width = gameArea.width
  canvas.height = gameArea.height
  r = (gameArea.cell / 2) * 10
  draw()
}

function setNextRoute (event) {
  if ( ! (event.key in keyMap)) {
    return
  }
  let requestedRoute = keyMap[event.key]
  if (requestedRoute === Routes.UP && mySnake().route === Routes.DOWN) {
    return
  }
  if (requestedRoute === Routes.DOWN && mySnake().route === Routes.UP) {
    return
  }
  if (requestedRoute === Routes.RIGHT && mySnake().route === Routes.LEFT) {
    return
  }
  if (requestedRoute === Routes.LEFT && mySnake().route === Routes.RIGHT) {
    return
  }
  if (game.status === 'playing') socket.emit('setRoute', {requestedRoute, snakeId})
}

function mySnake () {
  return getSnake(snakeId)
}

function getSnake (id) {
  return game.snakes.filter(snake => snake.id === id)[0]
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
    gameArea.cell, 
    gameArea.cell
  )
  ctx.closePath()
}

function drawBody (snake) {
  if (snake.positionBody.length >= 1) {
    for (let i = 0; i < snake.positionBody.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = '#63A794'
      ctx.fillRect(
        snake.positionBody[i].x, 
        snake.positionBody[i].y, 
        gameArea.cell, 
        gameArea.cell
      )
      ctx.closePath()
    }
  } 
}

function drawFood () {
  r += dir
  if (r === (gameArea.cell / 2) * 10 + 15 || r === (gameArea.cell / 2) * 10 - 30) dir *= -1
  ctx.beginPath()
  ctx.fillStyle = game.food.color
  ctx.arc(
    game.food.position.x + (gameArea.cell / 2), 
    game.food.position.y + (gameArea.cell / 2), 
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