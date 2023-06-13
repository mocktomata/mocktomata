/* eslint-disable no-console */
import delay from 'delay'
import { createStandardLogForTest } from 'standard-log/testing'
import { createTimeTracker } from './index.js'

const testOptions = { timeout: 10 }
const notCalled = () => {
	throw new Error('should not reach')
}
it('not started until elapse() is called', async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	let called = false
	createTimeTracker({ log }, testOptions, () => (called = true))
	await delay(10)
	expect(called).not.toBeTruthy()
})

it('invoke the callback when timeout is reached', async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	let called = false
	const timeTracker = createTimeTracker({ log }, testOptions, () => (called = true))
	timeTracker.elapse()
	await delay(40)

	timeTracker.stop()
	expect(called).toBeTruthy()
})

it('first elapse() returns 0', async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const timeTracker = createTimeTracker({ log }, testOptions, notCalled)
	const elapsed = timeTracker.elapse()
	timeTracker.stop()

	expect(elapsed).toBe(0)
})

it('duration returns total duration since first elapse() call', async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const timeTracker = createTimeTracker({ log }, { timeout: 200 }, notCalled)
	timeTracker.elapse()
	await delay(5)
	timeTracker.elapse()
	await delay(5)
	timeTracker.elapse()
	await delay(5)
	const actual = timeTracker.duration()

	timeTracker.stop()
	expect(actual).toBeGreaterThanOrEqual(10)
	expect(actual).toBeLessThanOrEqual(5000)
})

it('elapse() returns time passed since last elapse() call', async () => {
	const sl = createStandardLogForTest()
	const log = sl.getLogger('test')
	const timeTracker = createTimeTracker({ log }, { timeout: 2000 }, notCalled)

	let elapsedTotal = timeTracker.elapse()
	await delay(30)
	let elapsed = timeTracker.elapse()
	expect(elapsed).toBeGreaterThan(0)
	elapsedTotal += elapsed

	await delay(30)
	elapsed = timeTracker.elapse()
	expect(elapsed).toBeGreaterThan(0)
	elapsedTotal += elapsed

	const duration = timeTracker.stop()
	expect(duration).toBeGreaterThanOrEqual(elapsedTotal)

	timeTracker.stop()
})
