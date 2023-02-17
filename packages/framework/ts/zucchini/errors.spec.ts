import { DuplicateStep, MissingStep } from './errors.js'

describe(`${MissingStep.name}()`, () => {
	it('accepts string clause', () => {
		const e = new MissingStep('some step')
		expect(e.message).toEqual(`Step 'some step' is not defined`)
	})

	it('accepts regex', () => {
		const e = new MissingStep(/some step/)
		expect(e.message).toEqual(`Step /some step/ is not defined`)
	})
})

describe(`${DuplicateStep.name}()`, () => {
	const h = () => {}
	it('accepts string clause', () => {
		const e = new DuplicateStep('some step', h, h)
		expect(e.message).toMatch(/^Step 'some step' already defined/)
	})

	it('accepts regex', () => {
		const e = new DuplicateStep(/some step/, h, h)
		expect(e.message).toMatch(/^Step \/some step\/ already defined/)
	})
})
