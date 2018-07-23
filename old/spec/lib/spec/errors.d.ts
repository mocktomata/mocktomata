import { ModuleError } from 'iso-error';
import { SpecAction } from './spec/types';
export declare class SpecError extends ModuleError {
    constructor(description: string, ...errors: Error[]);
}
export declare class IDCannotBeEmpty extends SpecError {
    constructor();
}
export declare class SpecNotFound extends SpecError {
    specId: string;
    reason?: Error | undefined;
    constructor(specId: string, reason?: Error | undefined);
}
export declare class NotSpecable extends SpecError {
    subject: any;
    constructor(subject: any);
}
export declare class SimulationMismatch extends SpecError {
    specId: string;
    expected: Partial<SpecAction>;
    actual?: Partial<import("./spec/types").ConstructAction> | Partial<import("./spec/types").InvokeAction> | Partial<import("./spec/types").ReturnAction> | Partial<import("./spec/types").ThrowAction> | Partial<import("./spec/types").CallbackConstructAction> | undefined;
    constructor(specId: string, expected: Partial<SpecAction>, actual?: Partial<import("./spec/types").ConstructAction> | Partial<import("./spec/types").InvokeAction> | Partial<import("./spec/types").ReturnAction> | Partial<import("./spec/types").ThrowAction> | Partial<import("./spec/types").CallbackConstructAction> | undefined);
}
export declare class MissingArtifact extends SpecError {
    constructor(id: string);
}
//# sourceMappingURL=errors.d.ts.map
