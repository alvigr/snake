let canvas
let ctx

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
let start = false

const socket = io('http://localhost:3000');
socket.on('connect', function(){
});
socket.on('stream', function(data){
  // console.log('Received stream')
  game = data
  startStream()
});
socket.on('disconnect', function(){
  console.error('lost connection')
});

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  canvas.width = 300
  canvas.height = 300
}

function startStream () {
  if (!start) {
  r = (game.step / 2) * 10
  draw ()
  start = true
  }
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
  ctx.fillStyle = !game.play ? 'red' : 'LightSkyBlue'
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
    // game.step / 2,
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
