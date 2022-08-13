import { MocktomataError } from '../errors.js'

export class InvalidConfigFormat extends MocktomataError {
  // istanbul ignore next
  constructor(public filename: string) {
    super(`The ${filename} does not contain a valid configuration`)
  }
}

export class AmbiguousConfig extends MocktomataError {
  // istanbul ignore next
  constructor(public configs: string[]) {
    super(`Multiple configuration detected (${configs.join(', ')}). Please consolidate to one config.`)
  }
}

export class MissingConfigForFeature extends MocktomataError {
  // istanbul ignore next
  constructor(public feature: string, public configPath: string) {
    super(`Configuring ${configPath} is required to use ${feature}.`)
  }
}

export class ConfigPropertyIsInvalid extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string, public value: string) {
    super(`The property '${property}' is invalid: ${value}`)
  }
}

export class ConfigPropertyNotRecognized extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string) {
    super(`The property '${property}' is not a valid komondor option.`)
  }
}
