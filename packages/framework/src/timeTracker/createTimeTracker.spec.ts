import delay from 'delay'
import { createTimeTracker } from '.'

const testOptions = { timeout: 10 }
const notCalled = () => { throw new Error('should not reach') }
test('not started until elaspe() is called', async () => {
  let called = false
  createTimeTracker(testOptions, () => called = true)
  await delay(10)
  expect(called).not.toBeTruthy()
})

test('invoke the callback when timeout is reached', async () => {
  let called = false
  const timeTracker = createTimeTracker(testOptions, () => called = true)
  timeTracker.elaspe()
  await delay(10)

  timeTracker.stop()
  expect(called).toBeTruthy()
})

test('first elaspe() returns 0', async () => {
  const timeTracker = createTimeTracker(testOptions, notCalled)
  const elasped = timeTracker.elaspe()
  timeTracker.stop()

  expect(elasped).toBe(0)
})

test('duration returns total duration since first elaspe() call', async () => {
  const timeTracker = createTimeTracker(testOptions, notCalled)
  timeTracker.elaspe()
  await delay(5)
  timeTracker.elaspe()
  await delay(5)
  timeTracker.elaspe()
  await delay(5)
  const actual = timeTracker.duration()

  timeTracker.stop()
  expect(actual).toBeGreaterThanOrEqual(10)
  expect(actual).toBeLessThanOrEqual(200)
})

test('elaspe() returns time passed since last elaspe() call', async () => {
  const timeTracker = createTimeTracker({ timeout: 2000 }, notCalled)

  let elaspedTotal = timeTracker.elaspe()
  await delay(30)
  let elasped = timeTracker.elaspe()
  expect(elasped).toBeGreaterThan(0)
  elaspedTotal += elasped

  await delay(30)
  elasped = timeTracker.elaspe()
  expect(elasped).toBeGreaterThan(0)
  elaspedTotal += elasped

  const duration = timeTracker.stop()
  expect(duration).toBeGreaterThanOrEqual(elaspedTotal)

  timeTracker.stop()
})
