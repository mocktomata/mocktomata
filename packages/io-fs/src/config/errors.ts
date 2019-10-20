import { MocktomataError } from '@mocktomata/framework'

export class InvalidConfigFormat extends MocktomataError {
  // istanbul ignore next
  constructor(public filename: string) {
    super(`The ${filename} does not contain a valid configuration`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class AmbiguousConfig extends MocktomataError {
  // istanbul ignore next
  constructor(public configs: string[]) {
    super(`Multiple configuration detected (${configs.join(', ')}). Please consolidate to one config.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingConfigForFeature extends MocktomataError {
  // istanbul ignore next
  constructor(public feature: string, public configPath: string) {
    super(`Configuring ${configPath} is required to use ${feature}.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ConfigPropertyIsInvalid extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string, public cause: string) {
    super(`The property '${property}' is invalid: ${cause}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}


export class ConfigPropertyNotRecognized extends MocktomataError {
  // istanbul ignore next
  constructor(public property: string) {
    super(`The property '${property}' is not a valid komondor option.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
