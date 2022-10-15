import { ModuleError } from 'iso-error'
import { MocktomataError } from '../errors.js'

export class InvalidConfigFormat extends MocktomataError {
  // istanbul ignore next
  constructor(public filename: string, options?: ModuleError.Options) {
    super(`The ${filename} does not contain a valid configuration`, options)
  }
}

export class AmbiguousConfig extends MocktomataError {
  // istanbul ignore next
  constructor(public configs: string[], options?: ModuleError.Options) {
    super(`Multiple configuration detected (${configs.join(', ')}). Please consolidate to one config.`, options)
  }
}

export class MissingConfigForFeature extends MocktomataError {
  // istanbul ignore next
  constructor(public feature: string, public configPath: string, options?: ModuleError.Options) {
    super(`Configuring ${configPath} is required to use ${feature}.`, options)
  }
}

export class ConfigPropertyIsInvalid extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string, public value: string, options?: ModuleError.Options) {
    super(`The property '${property}' is invalid: ${value}`, options)
  }
}

export class ConfigPropertyNotRecognized extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string, options?: ModuleError.Options) {
    super(`The property '${property}' is not a valid komondor option.`, options)
  }
}
