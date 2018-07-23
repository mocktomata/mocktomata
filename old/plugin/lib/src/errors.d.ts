import { BaseError } from 'make-error';
import { SpecAction } from './interfaces';
export declare class SimulationMismatch extends BaseError {
    specId: string;
    expected: Partial<SpecAction>;
    actual?: Partial<SpecAction> | undefined;
    constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<SpecAction> | undefined);
}
//# sourceMappingURL=errors.d.ts.map