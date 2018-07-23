export declare type SpecMode = 'live' | 'save' | 'replay';
export declare type Spec<T> = {
    subject: T;
    done(): Promise<void>;
};
export declare type Meta = Record<string, any>;
export declare type SpecRecord = {
    actions: SpecAction[];
};
export declare type SpecIO = {
    readSpec(id: string): Promise<SpecRecord>;
    writeSpec(id: string, record: SpecRecord): Promise<void>;
};
export declare type SpecOptions = {
    timeout: number;
};
export declare type SpecAction = ConstructAction | InvokeAction | ReturnAction | ThrowAction | CallbackConstructAction;
export declare type ConstructAction = {
    name: 'construct';
    plugin: string;
    payload: any[] | undefined;
    meta?: Meta;
    instanceId: number;
};
export declare type InvokeAction = {
    name: 'invoke';
    plugin: string;
    payload: any[];
    meta?: Meta;
    instanceId: number;
    invokeId: number;
};
export declare type ReturnAction = {
    name: 'return';
    plugin: string;
    payload: any;
    meta?: Meta;
    instanceId: number;
    invokeId: number;
    returnType: string;
    returnInstanceId: number;
};
export declare type CallbackConstructAction = {
    name: 'construct-callback';
    plugin: string;
    payload: any[];
    meta?: Meta;
    instanceId: number;
    sourceType: string;
    sourceInstanceId: number;
    sourceInvokeId: number;
    sourceSite: (string | number)[];
};
export declare type ThrowAction = {
    name: 'throw';
    plugin: string;
    payload: any;
    meta?: Meta;
    instanceId: number;
    invokeId: number;
};
//# sourceMappingURL=types.d.ts.map