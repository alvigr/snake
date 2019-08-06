const snake = require('./snake')

jest.useFakeTimers()

afterEach(() => {
  snake.resetGame()
})

test('status playing after starting new game', () => {
  expect(snake.getState().status).toBe('wait')
  snake.resetGame()
  snake.newGame()
  expect(snake.getState().status).toBe('playing')
})

test('snake is moving', () => {
  snake.newGame()
  const { x } = snake.getState().snakes[0].positionHead

  jest.advanceTimersByTime(1000) 

  expect(snake.getState().snakes[0].positionHead.y).toBe(0)
  expect(snake.getState().snakes[0].positionHead.x).toBeGreaterThan(x)
})

test('snake move to down', () => {
  snake.newGame()
  let id = snake.getState().snakes[0].id
  snake.setNextRoute('down', id)
  jest.runOnlyPendingTimers()
  expect(snake.getState().snakes[0].positionHead.y).toBeGreaterThan(0)
})

test('snake level up', () => {
  const orig = Math.random
  const randVals = [0, 0, 0.9, 0.9]
  Math.random = () => { return randVals.shift() }

  snake.newGame()

  jest.runOnlyPendingTimers()
  expect(snake.getState().snakes[0].level).toBe(6)

  Math.random = orig
})


