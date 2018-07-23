import { SpecAction } from './specAction';
export declare type SpecMode = 'live' | 'save' | 'simulate';
export interface Spec<T> {
    subject: T;
    done(): Promise<void>;
}
export declare type Meta = Record<string, any>;
export declare type SpecRecord = {
    actions: SpecAction[];
};
export declare type SpecIO = {
    readSpec(id: string): Promise<SpecRecord>;
    writeSpec(id: string, record: SpecRecord): Promise<void>;
};
//# sourceMappingURL=interfaces.d.ts.map