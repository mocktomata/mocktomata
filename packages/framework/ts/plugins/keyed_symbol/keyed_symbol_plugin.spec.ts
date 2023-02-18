import { keyedSymbolPlugin } from './keyed_symbol_plugin.js'

it('supports keyed symbol', () => {
	expect(keyedSymbolPlugin.support(Symbol.for('abc'))).toBe(true)
})

it('does not support symbol without key', () => {
	expect(keyedSymbolPlugin.support(Symbol())).toBe(false)
})
