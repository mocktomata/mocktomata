export class MissingGivenHandler extends Error {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`Handler for '${clause}' not found.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class MissingSpecID extends Error {
  // istanbul ignore next
  constructor(public mode: string) {
    super(`Spec running in '${mode}' mode must have id defined.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class SpecNotFound extends Error {
  // istanbul ignore next
  constructor(public specId: string, public reason) {
    super(`Unable to find the spec record for '${specId}' due to: ${reason}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicateGivenHandler extends Error {
  // istanbul ignore next
  constructor(public clause: string | RegExp) {
    super(`Handler for '${clause}' is already defined.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class GivenSaveRequireSpecId extends Error {
  // istanbul ignore next
  constructor(public clause: string) {
    super(`given.save('${clause}', ...) requires spec to have id defined`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class DuplicatePlugin extends Error {
  // istanbul ignore next
  constructor(public pluginName: string) {
    super(`Plugin ${pluginName} is already loaded.`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
