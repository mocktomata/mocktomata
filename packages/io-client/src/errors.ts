import { BaseError } from 'make-error';

export class ServerNotAvailable extends BaseError {
  constructor(public url: string) {
    super(`Unable to connect to server at ${url}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// istanbul ignore next
export class ServerNotAvailableAtPortRange extends BaseError {
  constructor(public url: string, start: number, end: number) {
    super(`Unable to find komondor server at ${url} between port ${start} and ${end}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
