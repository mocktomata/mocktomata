import { MocktomataError } from '@mocktomata/framework'
import { ModuleError } from 'iso-error'
export class ServerNotAvailable extends MocktomataError {
  constructor(public url: string, options?: ModuleError.Options) {
    super(`Unable to connect to server at ${url}`, options)
  }
}

// istanbul ignore next
export class ServerNotAvailableAtPortRange extends MocktomataError {
  constructor(public url: string, start: number, end: number, options?: ModuleError.Options) {
    super(`Unable to find mocktomata server at ${url} between port ${start} and ${end}`, options)
  }
}
