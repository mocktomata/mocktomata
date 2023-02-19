import { logLevels } from 'standard-log'
import { mockto } from './index.js'

function inc(x: number) {
	return x + 1
}

async function incAsync(x: number) {
	return x + 1
}

mockto('basic usage', (specName, spec) => {
	test(specName, async () => {
		const s = await spec(inc)
		expect(s(1)).toBe(2)
		await spec.done()
	})
})

mockto('specify timeout', { timeout: 3000 }, (specName, spec) => {
	test(specName, async () => {
		const s = await spec(incAsync)
		expect(await s(1)).toBe(2)
		await spec.done()
	})
})

mockto('enable/disable log emit', { emitLog: false }, (specName, spec) => {
	test(specName, async () => {
		const s = await spec(inc)
		expect(s(1)).toBe(2)
		await spec.done()
	})
})

mockto('specify log level', { logLevel: logLevels.debug }, (specName, spec) => {
	test(specName, async () => {
		const s = await spec(inc)
		expect(s(1)).toBe(2)
		await spec.done()
	})
})

mockto('can inspect logs', { logLevel: logLevels.all }, (specName, spec, reporter) => {
	test(specName, async () => {
		const s = await spec(inc)
		expect(s(1)).toBe(2)
		const messages = reporter.getLogMessagesWithIdAndLevel()
		expect(messages.length).toBeGreaterThan(0)
		messages.forEach(msg => expect(msg.startsWith(`mocktomata:can inspect logs:`)).toBe(true))
		await spec.done()
	})
})
