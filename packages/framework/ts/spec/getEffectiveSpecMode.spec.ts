import { getEffectiveSpecMode } from './getEffectiveSpecMode.js'

test('change mode with match file path filter', () => {
	const actual = getEffectiveSpecMode(
		{ overrideMode: 'save', filePathFilter: /part-a/ },
		'',
		'c/b/part-a/x.ts'
	)

	expect(actual).toBe('save')
})

test('change mode when both file and name matches', () => {
	const config = { overrideMode: 'save' as const, filePathFilter: /part-a/, specNameFilter: /run-me/ }
	expect(getEffectiveSpecMode(config, 'not-me', 'c/b/part-a/x.ts')).toBe('auto')
	expect(getEffectiveSpecMode(config, 'cannot run-me', 'someother.ts')).toBe('auto')
	expect(getEffectiveSpecMode(config, 'yes run-me now', 'c/b/part-a/x.ts')).toBe('save')
})
