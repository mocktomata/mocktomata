import { a } from 'assertron'
import { mockto } from './index.js'

function modFn() {}

it('throws when ssf not in line of execution', () => {
	const err = a.throws(() => mockto('throw when ssf not in line of execution', { ssf: modFn }, () => {}))
	expect(err.message).toEqual(`Unable to get relative path of the test from 'modFn'.
It should be a function you called directly in the test.`)
})

it('throws when ssf not in line of execution and arrow', () => {
	const err = a.throws(() => mockto('throw when ssf not in line of execution', { ssf: () => {} }, () => {}))
	expect(err.message).toEqual(`Unable to get relative path of the test from 'ssf'.
It should be a function you called directly in the test.`)
})
