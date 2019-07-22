let canvas
let ctx

let timerId

// for animation:
let animate
let r
let dir = 1
//

let game = {
  step: 20,
  speed: 200,
  nextRoute: '',
  snake: {
    level: 5,
    positionHead: {
      x: -15,
      y: 0
    },
    positionBody: [],
    route: 'right'
  },
  food: {
    position: {
      x: 100,
      y: 100
    },
    color: '',
    colorsSet: [
      'FireBrick', 
      'MediumVioletRed', 
      'OrangeRed', 
      'Violet', 
      'Purple', 
      'Indigo',
      'Chocolate',
      'Brown'
    ]
  },
  play: true,
}

function init () {
  canvas = document.getElementById('canvas')
  ctx = canvas.getContext('2d')
  document.addEventListener('keydown', setNextRoute)
  canvas.width = 300
  canvas.height = 300
}

function startNewGame () {
  cancelAnimationFrame(animate)
  clearInterval(timerId)
  clearScreen()
  game.speed = 200
  game.play = true
  game.snake.positionHead.x = game.step * (-1)
  game.snake.positionHead.y = 0
  game.snake.level = 5
  game.snake.positionBody = []
  game.nextRoute = 'right'
  game.snake.route = 'right'
  setFood()
  timerId = window.setInterval(playGame, game.speed)
  r = (game.step / 2) * 10
  draw()
}

function playGame () {
  finishGame()
  setRoute()
  moveTail()
  moveHead()
  eatFood()
  checkPlay()
  moveBody()
  console.log(game.snake.positionHead)
  console.log(...game.snake.positionBody)
}

function setNextRoute (event) {
  if (
      event.key === 'ArrowDown'
      & game.snake.route !== 'up'
      & game.snake.route !== 'down'
    ) {
    game.nextRoute = 'down'
  }
  if (
      event.key === 'ArrowUp'
      & game.snake.route !== 'down'
      & game.snake.route !== 'up'
    ) {
    game.nextRoute = 'up'
  }
  if (
      event.key === 'ArrowLeft'
      & game.snake.route !== 'right'
      & game.snake.route !== 'left'
      ) {
    game.nextRoute = 'left'
  }
  if (
      event.key === 'ArrowRight'
      & game.snake.route !== 'left'
      & game.snake.route !== 'right'
      ) {
    game.nextRoute = 'right'
  }
}

function setRoute () {
  game.snake.route = game.nextRoute  
}

function moveHead () {
  if (game.snake.route === 'right') {
    game.snake.positionHead.x += game.step
    if (game.snake.positionHead.x >= canvas.width) {
      game.snake.positionHead.x = 0
    }
  }
  if (game.snake.route === 'left') {
    game.snake.positionHead.x -= game.step
    if (game.snake.positionHead.x < 0) {
      game.snake.positionHead.x = canvas.width - game.step
    }
  }
  if (game.snake.route === 'up') {
    game.snake.positionHead.y -= game.step
    if (game.snake.positionHead.y < 0) {
      game.snake.positionHead.y = canvas.height - game.step
    }
  }
  if (game.snake.route === 'down') {
    game.snake.positionHead.y += game.step
    if (game.snake.positionHead.y >= canvas.height) {
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
    x: randomInteger(0, (canvas.width - game.step) / game.step) * game.step, 
    y: randomInteger(0, (canvas.height - game.step) / game.step) * game.step
  }
  if (
    game.snake.positionBody.findIndex(function (element) {
      if (element.x === posForFood.x & element.y === posForFood.y) {
        return true
      }
    }) === -1
    & posForFood.x !== game.food.position.x
    & posForFood.y !== game.food.position.y
    ) {
    game.food.position.x = posForFood.x
    game.food.position.y = posForFood.y
  } else {
    setFood()
  }
  game.food.color = game.food.colorsSet[
    randomInteger(0, game.food.colorsSet.length - 1)
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
        & element.y === game.snake.positionHead.y
        ) {
        return true
      }
    }
  )) {
    game.play = false
  }
}

function finishGame () {
  if (!game.play) {
    alert("Ваш результат: " + game.snake.level)
    startNewGame()
  }
}

function moveBody () {
  game.snake.positionBody.push({
    x: game.snake.positionHead.x, 
    y: game.snake.positionHead.y
  })
}

function moveTail () {
  while (game.snake.positionBody.length >= game.snake.level) {
    game.snake.positionBody.shift()
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
  ctx.beginPath()
  ctx.fillStyle = !game.play ? 'red' : 'LightSkyBlue'
  ctx.fillRect(
    game.snake.positionHead.x, 
    game.snake.positionHead.y, 
    game.step, 
    game.step
  )
  ctx.closePath()
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