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

const socket = io('http://localhost:3000')
socket.on('connect', function() {
  console.log('Connected to server')
})
socket.on('stream', function (data) {
  game = data
  document.getElementById('score').innerText = game.snake.level
})
// socket.on('event', function(data) {
//   console.log('Received event', data)
// })
socket.on('disconnect', function () {
  console.error('lost connection')
})

document.getElementById('pause').addEventListener('click', pause)

document.getElementById('newGame').addEventListener('click', newGame)

function pause () {
  if (game.status === 'playing') {
    clearInterval(timerId)
    document.getElementById('textOnpause').innerText = 'Resume'
    socket.emit('paused')
  } else if (game.status === 'paused') {
    timerId = window.setInterval(playGame, game.speed)
    document.getElementById('textOnpause').innerText = 'Pause'
    socket.emit('resumed')
  }
}

function newGame () {
  socket.emit('startNewGame')
  startNewGame()
}

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  document.addEventListener('keydown', setNextRoute)
  canvas.width = 300
  canvas.height = 300
  let img = document.getElementById('snake')
  ctx.drawImage(img, -100, 0)
}

function startNewGame () {
  cancelAnimationFrame(animate)
  r = (game.step / 2) * 10
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
  ctx.fillStyle = game.status === 'finished' ? 'red' : 'LightSkyBlue'
  ctx.fillRect(
    game.snake.positionHead.x, 
    game.snake.positionHead.y, 
    game.step, 
    game.step
  )
  ctx.closePath()
  // console.log(game.snake.positionHead.x, game.snake.positionBody[game.snake.positionBody.length - 1].x)
}

function drawBody () {
  if (game.snake.positionBody.length >= 1) {
    for (let i = 0; i < game.snake.positionBody.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = 'PeachPuff'
      ctx.fillRect(
        game.snake.positionBody[i].x, 
        game.snake.positionBody[i].y, 
        game.step, 
        game.step
      )
      ctx.closePath()
    }
  } 
}

function drawFood () {
  r += dir
  if (r === (game.step / 2) * 10 + 15 || r === (game.step / 2) * 10 - 30) dir *= -1
  ctx.beginPath()
  ctx.fillStyle = game.food.color
  ctx.arc(
    game.food.position.x + (game.step / 2), 
    game.food.position.y + (game.step / 2), 
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