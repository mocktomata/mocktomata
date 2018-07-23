import { BaseError } from 'make-error';
import { SpecAction } from '../specAction';
export declare class SimulationMismatch extends BaseError {
    specId: string;
    expected: Partial<SpecAction>;
    actual: Partial<SpecAction> | undefined;
    constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<SpecAction> | undefined);
}
export declare class SourceNotFound extends BaseError {
    action: SpecAction;
    constructor(action: SpecAction);
}
//# sourceMappingURL=errors.d.ts.map