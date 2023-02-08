import { ModuleError } from 'iso-error'
import { mapKey } from 'type-plus'
import { MocktomataError } from '../errors.js'

export class InvalidConfigFormat extends MocktomataError {
	constructor(public filename: string, options?: ModuleError.Options) {
		super(`The file '${filename}' does not contain a valid configuration`, options)
	}
}

export class AmbiguousConfig extends MocktomataError {
	constructor(public configs: string[], options?: ModuleError.Options) {
		super(
			`Multiple configuration detected. Please consolidate to one config.

configs:
${configs.map(c => `- ${c}`).join('\n')}`,
			options
		)
	}
}

export class ConfigPropertyMismatch extends MocktomataError {
	constructor(
		public filePath: string,
		public filePropertyPath: string,
		public fileValue: unknown,
		public envName: string,
		public envValue: unknown,
		options?: ModuleError.Options
	) {
		super(
			`The property value mismatch:

- ${filePropertyPath} (from '${filePath}'): ${fileValue}
- ${envName}: ${envValue}`,
			options
		)
	}
}

export class ConfigPropertyInvalid extends MocktomataError {
	constructor(public property: string, public value: unknown, options?: ModuleError.Options) {
		super(`The property '${property}' is invalid: ${value}`, options)
	}
}

export class ConfigHasUnrecognizedProperties extends MocktomataError {
	constructor(public filePath: string, values: Record<string, any>, options?: ModuleError.Options) {
		super(
			`The config in '${filePath}' contains unrecognized properties:

${mapKey(values, k => `- ${k}: ${values[k]}`).join('\n')}`,
			options
		)
	}
}
export class CannotConfigAfterUsed extends MocktomataError {
	constructor(options?: ModuleError.Options) {
		super(`config() can only be called before usage.`, options)
	}
}
