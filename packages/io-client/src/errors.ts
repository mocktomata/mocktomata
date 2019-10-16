import { KomondorError } from '@mocktomata/framework';

export class ServerNotAvailable extends KomondorError {
  constructor(public url: string) {
    super(`Unable to connect to server at ${url}`)
  }
}

// istanbul ignore next
export class ServerNotAvailableAtPortRange extends KomondorError {
  constructor(public url: string, start: number, end: number) {
    super(`Unable to find komondor server at ${url} between port ${start} and ${end}`)
  }
}
