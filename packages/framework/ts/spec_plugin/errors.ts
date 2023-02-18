import { ModuleError } from 'iso-error'
import { MocktomataError } from '../errors.js'

export class PluginNotFound extends MocktomataError {
	// istanbul ignore next
	constructor(public pluginName: string, options?: ModuleError.Options) {
		super(`Could not locate plugin '${pluginName}'`, options)
	}
}

export class DuplicatePlugin extends MocktomataError {
	// istanbul ignore next
	constructor(public pluginName: string, options?: ModuleError.Options) {
		super(`A plugin with the name '${pluginName}' has already been loaded.`, options)
	}
}

export class PluginModuleNotConforming extends MocktomataError {
	// istanbul ignore next
	constructor(public pluginName: string, options?: ModuleError.Options) {
		super(`${pluginName} is not a valid plugin module.`, options)
	}
}

export class PluginNotConforming extends MocktomataError {
	// istanbul ignore next
	constructor(public pluginName: string, options?: ModuleError.Options) {
		super(`${pluginName} is not a plugin.`, options)
	}
}
