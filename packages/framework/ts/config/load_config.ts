import { toLogLevel } from 'standard-log'
import { record } from 'type-plus'
import type { Spec } from '../spec/types.js'
import type { Mocktomata } from '../types.js'
import { CannotConfigAfterUsed, ConfigPropertyInvalid } from './errors.js'
import type { Config } from './types.js'

// TODO: it's not good to throw error, as `mockto` are executed outside `test()`,
// it may terminate the test runner.

export function createConfigurator() {
	const store = record<Config.ResultContext>()
	return {
		config(input: Config.Input) {
			if (store.config) throw new CannotConfigAfterUsed()
			store.config = buildConfig(input)
		},
		store
	}
}

export async function loadConfig({ io, configurator, log }: Mocktomata.Context) {
	log.trace('loadConfig()')
	const config = (configurator.store.config = {
		...buildConfig(await io.loadConfig()),
		...configurator.store.config
	})
	return { config }
}

export function buildConfig(input: Config.Input, _input2?: Config.Input): Config {
	return {
		emitLog: input.emitLog,
		logLevel: resolveLogLevel(input.logLevel),
		ecmaVersion: resolveEcmaVersion(input),
		plugins: resolvePlugins(input),
		filePathFilter: resolveFilePathFilter(input),
		specNameFilter: resolveSpecNameFilter(input),
		overrideMode: resolveOverrideMode(input)
	}
}

export function resolveLogLevel(logLevel: unknown) {
	if (!logLevel) return undefined
	if (typeof logLevel === 'number') {
		if (logLevel < 0) throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: loadConfig })
		return logLevel
	}
	if (typeof logLevel !== 'string') throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: loadConfig })
	const result = toLogLevel(logLevel.toLowerCase())
	if (!result) throw new ConfigPropertyInvalid('logLevel', logLevel, { ssf: loadConfig })
	return result
}

function resolveEcmaVersion(config: Config.Input) {
	return extractEcmaVersion(config.ecmaVersion) ?? ('es2015' as const)
}

function extractEcmaVersion(input?: unknown) {
	if (!input) return undefined
	if (typeof input !== 'string') throw new ConfigPropertyInvalid('ecmaVersion', input!, { ssf: loadConfig })
	const version = input.toLowerCase()
	if (!['es2015', 'es2020'].includes(version))
		throw new ConfigPropertyInvalid('ecmaVersion', input!, { ssf: loadConfig })
	return version as 'es2015' | 'es2020'
}

function resolvePlugins(config: Config.Input) {
	const plugins = config.plugins
	if (!plugins) return []
	if (!Array.isArray(plugins)) throw new ConfigPropertyInvalid('plugins', plugins, { ssf: loadConfig })
	return plugins
}

function resolveFilePathFilter(config: Config.Input) {
	const v = extractFilter('filePathFilter', config.filePathFilter)
	return v ? new RegExp(v) : undefined
}

function resolveSpecNameFilter(config: Config.Input) {
	const v = extractFilter('specNameFilter', config.specNameFilter)
	return v ? new RegExp(v) : undefined
}

function extractFilter(name: string, filter?: unknown) {
	if (!filter) return undefined
	if (typeof filter !== 'string') throw new ConfigPropertyInvalid(name, filter, { ssf: loadConfig })
	return filter
}

function resolveOverrideMode(config: Config.Input) {
	return extractMode(config.overrideMode)
}

function extractMode(value?: unknown) {
	if (!value) return undefined
	if (typeof value !== 'string') throw new ConfigPropertyInvalid('overrideMode', value, { ssf: loadConfig })
	const v = value.toLowerCase()
	if (['save', 'live', 'simulate'].indexOf(v) < 0)
		throw new ConfigPropertyInvalid('overrideMode', value, { ssf: loadConfig })
	return v as Spec.OverrideMode
}
