import { KomondorError } from '../common';
import { SpecAction } from './types';
export declare class IDCannotBeEmpty extends KomondorError {
    constructor();
}
export declare class SpecNotFound extends KomondorError {
    specId: string;
    reason?: Error | undefined;
    constructor(specId: string, reason?: Error | undefined);
}
export declare class NotSpecable extends KomondorError {
    subject: any;
    constructor(subject: any);
}
export declare class SimulationMismatch extends KomondorError {
    specId: string;
    expected: Pick<SpecAction, 'type'>;
    actual?: Pick<SpecAction, "type"> | undefined;
    constructor(specId: string, expected: Pick<SpecAction, 'type'>, actual?: Pick<SpecAction, "type"> | undefined);
}
//# sourceMappingURL=errors.d.ts.map