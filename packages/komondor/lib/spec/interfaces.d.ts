export interface SpecAction {
    type: string;
    name: string;
    payload: any;
    meta?: Meta;
    instanceId?: number;
    invokeId?: number;
    sourceType?: string;
    sourceInstanceId?: number;
    sourceInvokeId?: number;
    sourceSite?: (string | number)[];
    returnType?: string;
    returnInstanceId?: number;
}
export declare type SpecMode = 'live' | 'save' | 'simulate';
export interface Spec<T> {
    subject: T;
    done(): Promise<void>;
}
export declare type Meta = Record<string, any>;
//# sourceMappingURL=interfaces.d.ts.map