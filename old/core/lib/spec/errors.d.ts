import { BaseError } from 'make-error';
import { SpecAction } from './specAction';
export declare class SpecNotFound extends BaseError {
    specId: string;
    reason?: Error | undefined;
    constructor(specId: string, reason?: Error | undefined);
}
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
    actual?: Partial<import("./specAction").ConstructAction> | Partial<import("./specAction").InvokeAction> | Partial<import("./specAction").ReturnAction> | Partial<import("./specAction").ThrowAction> | Partial<import("./specAction").CallbackConstructAction> | undefined;
    constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<import("./specAction").ConstructAction> | Partial<import("./specAction").InvokeAction> | Partial<import("./specAction").ReturnAction> | Partial<import("./specAction").ThrowAction> | Partial<import("./specAction").CallbackConstructAction> | undefined);
}
export declare class MissingArtifact extends BaseError {
    constructor(id: string);
}
//# sourceMappingURL=errors.d.ts.map