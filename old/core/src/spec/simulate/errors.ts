import { BaseError } from 'make-error';
import { tersify } from 'tersify';
import { SpecAction } from '../specAction';

export declare class SimulationMismatch extends BaseError {
  specId: string;
  expected: Partial<SpecAction>;
  actual: Partial<SpecAction> | undefined;
  constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<SpecAction> | undefined);
}

export class SourceNotFound extends BaseError {
  // istanbul ignore next
  constructor(public action: SpecAction) {
    super(`Unable to locate source action for ${tersify(action, { maxLength: Infinity })}`)

    Object.setPrototypeOf(this, new.target.prototype)
  }
}
