const snake = require('./snake')

jest.useFakeTimers()

afterEach(() => {
  snake.resetGame()
})

test('status playing after starting new game', () => {
  expect(snake.getState().status).toBe('wait')
  snake.newGame()
  expect(snake.getState().status).toBe('playing')
})

test('snake is moving', () => {
  snake.newGame()
  const { x } = snake.getState().snake.positionHead

  jest.advanceTimersByTime(1000) 

  expect(snake.getState().snake.positionHead.y).toBe(0)
  expect(snake.getState().snake.positionHead.x).toBeGreaterThan(x)
})

test('snake move to down', () => {
  snake.newGame()
  snake.setNextRoute('down')
  jest.runOnlyPendingTimers()
  expect(snake.getState().snake.positionHead.y).toBeGreaterThan(0)
})

test('snake level up', () => {
  const orig = Math.random
  const randVals = [0, 0, 0.9, 0.9]
  Math.random = () => { return randVals.shift() }

  snake.newGame()

  jest.runOnlyPendingTimers()
  expect(snake.getState().snake.level).toBe(6)

  Math.random = orig
})


