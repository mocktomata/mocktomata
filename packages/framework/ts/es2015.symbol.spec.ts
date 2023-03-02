import { incubator } from './incubator/index.js'

function giveSymbol() {
	return Symbol.for('abc')
}

incubator('handles keyed symbol as return value', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(giveSymbol)
		expect(s()).toEqual(Symbol.for('abc'))
		await spec.done()
	})
})

function takeSymbol(sym: symbol) {
	return sym
}
incubator('handles keyed symbol as input value', (specName, spec) => {
	it(specName, async () => {
		const s = await spec(takeSymbol)
		expect(s(Symbol.for('abc'))).toEqual(Symbol.for('abc'))
		await spec.done()
	})
})
