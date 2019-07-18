let { setRoute } = require('./main')


test('handle press down', () => {
  setRoute({key: 'ArrowDown'})
  expect(route).toBe('down')
})