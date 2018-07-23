import { SpecAction, SpecRecord } from './types';
export declare type SpecRecordTracker = ReturnType<typeof createSpecRecordTracker>;
export declare function createSpecRecordTracker(record: SpecRecord): {
    getReference(plugin: string, target: any): string;
    findReference(target: any): string | undefined;
    invoke(ref: string, args: any[]): void;
    return(ref: string, result: any): void;
    throw(ref: string, err: any): void;
    addAction(action: SpecAction): void;
};
export declare type SpecRecordValidator = ReturnType<typeof createSpecRecordValidator>;
export declare function createSpecRecordValidator(id: string, loaded: SpecRecord, record: SpecRecord): {
    getReference(plugin: string, target: any): string;
    findReference(target: any): string | undefined;
    resolveTarget(ref: string): any;
    invoke(ref: string, args: any[]): void;
    return(ref: string, result: any): void;
    throw(ref: string, err: any): void;
    addAction(action: SpecAction): void;
    succeed(): boolean;
    result(): any;
};
//# sourceMappingURL=SpecRecord.d.ts.map