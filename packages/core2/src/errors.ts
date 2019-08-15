import { ModuleError } from 'iso-error';

export class KomondorError extends ModuleError {
  constructor(description: string, ...errors: Error[]) {
    super('komondor', description, ...errors)
  }
}
