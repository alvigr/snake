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
let x
let y
let dirHx
let dirHy
//

let game
let stepGame

const socket = io('http://localhost:3000')

socket.on('connect', function() {
  console.log('Connected to server')
})

socket.on('stream', function (data) {
  game = data.data
  stepGame = data.step
  console.log('Game получен', game.status)
  document.getElementById('score').innerText = game.snake.level
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
  document.getElementById('body-game').style.display="none"
  document.getElementById('gameplay').style.display="block"
  startNewGame()
}

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  document.addEventListener('keydown', setNextRoute)
  document.getElementById('pause').addEventListener('click', pause)
  document.getElementById('newGame').addEventListener('click', newGame)
  document.getElementById('restart').addEventListener('click', newGame)
  document.getElementById('exit').addEventListener('click', exit)
  socket.emit('wait')
}

function exit () {
  console.log('exit')
  socket.emit('wait')
  document.getElementById('body-game').style.display=""
  document.getElementById('gameplay').style.display="none"
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
  // console.log(game.snake.positionHead)
  // console.log(...game.snake.positionBody)
  
  //socket.emit('game', game)
}

function setNextRoute (event) {
  if ( ! (event.key in keyMap)) {
    return
  }
  let requestedRoute = keyMap[event.key]
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
  if (game.status === 'playing') socket.emit('setRoute', requestedRoute)
}

function draw () {
  clearScreen()
  drawFood()
  drawBody()
  drawHead()
  animate = requestAnimationFrame(draw)
}

function drawHead () {
  dirHx = (game.snake.positionHead.x - game.snake.positionBody[game.snake.positionBody.length - 2].x) / game.step
  dirHy = (game.snake.positionHead.y - game.snake.positionBody[game.snake.positionBody.length - 2].y) / game.step
  x += (game.step / 12) * dirHx
  y += (game.step / 12) * dirHy
  ctx.beginPath()
  ctx.fillStyle = game.status === 'finished' ? '#D73333' : '#366A5D'
  ctx.fillRect(
    game.snake.positionHead.x, 
    game.snake.positionHead.y, 
    stepGame, 
    stepGame
  )
  ctx.closePath()
  // console.log(game.snake.positionHead.x, game.snake.positionBody[game.snake.positionBody.length - 1].x)
}

function drawBody () {
  if (game.snake.positionBody.length >= 1) {
    for (let i = 0; i < game.snake.positionBody.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = '#63A794'
      ctx.fillRect(
        game.snake.positionBody[i].x, 
        game.snake.positionBody[i].y, 
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