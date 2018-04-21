import { BaseError } from 'make-error'
import { tersify } from 'tersify'

export class MissingGivenHandler extends BaseError {
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

export class InvalidSpecID extends BaseError {
  // istanbul ignore next
  constructor(public specId: string) {
    super(`The spec id '${specId}' contains invalid characters. It must be file path valid characters.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}


export class SpecNotFound extends BaseError {
  // istanbul ignore next
  constructor(public specId: string, public reason) {
    super(`Unable to find the spec record for '${specId}' due to: ${reason}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NotSpecable extends BaseError {
  constructor(public subject) {
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

export class GivenSaveRequireSpecId extends BaseError {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`given.save('${clause}', ...) requires spec to have id defined`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicatePlugin extends BaseError {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Plugin ${pluginName} is already loaded.`)

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
