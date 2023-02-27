import { requiredDeep } from 'type-plus'
import type { Config } from './config/types.js'
import { es2015 } from './es2015.js'
import type { SpecPlugin } from './spec_plugin/types.js'
import { SpecNotFound } from './spec/index.js'
import type { Mocktomata } from './types.js'
import { json } from './json.js'

export namespace newMemoryIO {
	export type Options = {
		modules?: Record<string, SpecPlugin.Module>
		config?: Config.Input
	}
	export type TestIO = {
		addPlugin(moduleName: string, pluginModule: SpecPlugin.Module): void
	} & Mocktomata.IO
}

export function newMemoryIO(options?: newMemoryIO.Options): newMemoryIO.TestIO {
	const specStore = new Map<string, string>()
	const { config, modules } = requiredDeep(
		{
			config: {},
			modules: { [es2015.name]: es2015 } as Record<string, SpecPlugin.Module>
		},
		options
	)
	return {
		async loadConfig() {
			return config
		},
		readSpec(specName, specRelativePath) {
			const record = specStore.get(specName)
			if (!record) return Promise.reject(new SpecNotFound(specName, specRelativePath))
			return Promise.resolve(json.parse(record))
		},
		async writeSpec(specName, _specRelativePath, record) {
			specStore.set(specName, json.stringify(record))
		},
		addPlugin(moduleName: string, pluginModule: SpecPlugin.Module) {
			modules[moduleName] = pluginModule
		},
		loadPlugin(name) {
			const m = modules[name]
			if (m) return Promise.resolve(m)
			throw new Error(`module ${name} not found`)
		}
	}
}
