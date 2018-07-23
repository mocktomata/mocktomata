import { BaseError } from 'make-error';
import { SpecAction } from './interfaces';
export declare class IDCannotBeEmpty extends BaseError {
    constructor();
}
export declare class NotSpecable extends BaseError {
    subject: any;
    constructor(subject: any);
}
export declare class SimulationMismatch extends BaseError {
    specId: string;
    expected: Partial<SpecAction>;
    actual?: Partial<SpecAction> | undefined;
    constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<SpecAction> | undefined);
}
export declare class MissingArtifact extends BaseError {
    constructor(id: string);
}
//# sourceMappingURL=errors.d.ts.map