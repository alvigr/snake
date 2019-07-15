const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
const colorsFood = [
  'FireBrick', 
  'MediumVioletRed', 
  'OrangeRed', 
  'Violet', 
  'Purple', 
  'Indigo',
  'Chocolate',
  'Brown'
]
const step = 15
canvas.width = 600
canvas.height = 600

let speedSnake = 0
let game = true

let snake = []
let snakeLength = 0

let posHead = []

let posFood = []
let colorFood = ''

let route = ''
let allowSetRoute

startNewGame ()

window.setInterval(draw, speedSnake)

document.addEventListener('keydown', setRoute)

function startNewGame () {
  clearScreen()
  speedSnake = 50
  game = true
  posHead = [step * (-1), 0]
  snakeLength = 5
  snake = []
  route = 'right'
  setFood()
  allowSetRoute = true
}

function draw () {
  console.log(game)
  finishGame()
  clearScreen()
  setSnake()
  posHead = setRouteDrow(posHead, route)
  eatFood()
  drawBody()
  drawFood()
  drawHead()
  game = !checkGameOver()
  allowSetRoute = true
}

function setRoute (event) {
  if (allowSetRoute) {
    if (event.key === 'ArrowDown' & route !== 'up' & route !== 'down') {
      route = 'down'
    }
    if (event.key === 'ArrowUp' & route !== 'down' & route !== 'up') {
      route = 'up'
    }
    if (event.key === 'ArrowLeft' & route !== 'right' & route !== 'left') {
      route = 'left'
    }
    if (event.key === 'ArrowRight' & route !== 'left' & route !== 'right') {
      route = 'right'
    }
    allowSetRoute = false
  }
}

function setRouteDrow (position, routeMove) {
  if (routeMove === 'right') {
    position[0] += step
    if (position[0] >= canvas.width) {
      position[0] = 0
    }
  }
  if (routeMove === 'left') {
    position[0] -= step
    if (position[0] < 0) {
      position[0] = canvas.width - step
    }
  }
  if (routeMove === 'up') {
    position[1] -= step
    if (position[1] < 0) {
      position[1] = canvas.height - step
    }
  }
  if (routeMove === 'down') {
    position[1] += step
    if (position[1] >= canvas.height) {
      position[1] = 0
    }
  }
  return position
}

function randomInteger (min, max) {
  let rand = min + Math.random() * (max + 1 - min);
  rand = Math.floor(rand);
  return rand;
}

function setFood () {
  let x = randomInteger(0, (canvas.width - step) / step) * step
  let y = randomInteger(0, (canvas.height - step) / step) * step
  if (snake.findIndex(checkSnake) === -1 & x !== posFood[0] & y !== posFood[1]) {
    posFood[0] = x
    posFood[1] = y
  } else {
    x = canvas.width
    y = canvas.height
    setFood ()
  }
  function checkSnake (element) {
    if (element[0] === x & element[1] === y) {
      return true
    }
  }
  colorFood = colorsFood[randomInteger(0, colorsFood.length - 1)]
}

function checkFood () {
  if (posHead[0] === posFood[0] & posHead[1] === posFood[1]) {
    return true
  }
}

function eatFood () {
  if (checkFood()) {
    snakeLength++
    setFood()
  }
}

function checkGameOver () {
  if (snake.find(checkSnake)) {
    return true
  }
}

function finishGame () {
  if (!game) {
    alert("Ваш езультат: " + snakeLength)
    startNewGame()
  }
}

function checkSnake (element) {
  if (element[0] === posHead[0] & element[1] === posHead[1]) {
    return true
  }
}

function setSnake () {
  console.log('before', ...snake)
  snake.push([posHead[0], posHead[1]])
  while (snake.length >= snakeLength) {
    snake.shift()
  }
  console.log('after', ...snake)
  //debugger
}

function drawHead () {
  ctx.beginPath()
  ctx.fillStyle = !game ? 'red' : 'LightSkyBlue'
  ctx.fillRect(posHead[0], posHead[1], step, step)
  ctx.closePath()
}

function drawBody () {
  if (snake.length >= 1) {
    for (let i = 0; i < snake.length; i++) {
      ctx.beginPath()
      ctx.fillStyle = 'PeachPuff'
      ctx.fillRect(snake[i][0], snake[i][1], step, step)
      ctx.closePath()
    }
  } 
}

function drawFood () {
  ctx.beginPath()
  ctx.fillStyle = colorFood
  ctx.arc(posFood[0] + (step / 2), posFood[1] + (step / 2), step / 2, 0, Math.PI*2)
  ctx.closePath()
  ctx.fill()
}

function clearScreen () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}
