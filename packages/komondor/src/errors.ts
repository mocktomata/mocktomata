import { SpecActionWithSource } from 'komondor-plugin'
import { BaseError } from 'make-error'
import { tersify } from 'tersify'

export class MissingGivenHandler extends BaseError {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`Handler for '${clause}' not found.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingHandler extends BaseError {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`Handler for '${clause}' not found.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingSpecID extends BaseError {
  // istanbul ignore next
  constructor(public mode: string) {
    super(`Spec running in '${mode}' mode must have id defined.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class InvalidID extends BaseError {
  static isInvalidID(id: string) {
    return id && /[:*;?,"<>]/.test(id)
  }
  // istanbul ignore next
  constructor(public specId: string) {
    super(`The spec id '${specId}' contains invalid characters. It must be file path valid characters.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SourceNotFound extends BaseError {
  // istanbul ignore next
  constructor(public action: SpecActionWithSource) {
    super(`Unable to locate source action for ${tersify(action, { maxLength: Infinity })}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SpecNotFound extends BaseError {
  // istanbul ignore next
  constructor(public specId: string, public reason?: string) {
    super(reason ?
      `Unable to find the spec record for '${specId}' due to: ${reason}` :
      `Unable to find the spec record for '${specId}'`
    )

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class ScenarioNotFound extends BaseError {
  // istanbul ignore next
  constructor(public scenarioId: string) {
    super(`Unable to find the scenario record for '${scenarioId}'`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotSpecable extends BaseError {
  // istanbul ignore next
  constructor(public subject: any) {
    super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicateGivenHandler extends BaseError {
  // istanbul ignore next
  constructor(public clause: string | RegExp) {
    super(`Handler for '${clause}' is already defined.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicateHandler extends BaseError {
  // istanbul ignore next
  constructor(public clause: string | RegExp) {
    super(`Handler for '${clause}' is already defined.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class GivenSaveRequireSpecId extends BaseError {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`given.save('${clause}', ...) requires spec to have id defined`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingReturnRecord extends BaseError {
  // istanbul ignore next
  constructor() {
    super(`No return record found. Corrupted spec?`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingArtifact extends BaseError {
  // istanbul ignore next
  constructor(id: string) {
    super(`Missing artifact: ${id}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotConfigured extends BaseError {
  // istanbul ignore next
  constructor(public feature: string, public configPath: string) {
    super(`Configuring ${configPath} is required to use ${feature}.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
