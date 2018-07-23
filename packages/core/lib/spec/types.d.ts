export declare type SpecMode = 'live' | 'save' | 'simulate' | 'auto';
export declare type Spec<T> = {
    subject: T;
    done(): Promise<void>;
};
export declare type SpecOptions = {
    timeout: number;
};
export declare type SpecIO = {
    readSpec(id: string): Promise<SpecRecord>;
    writeSpec(id: string, record: SpecRecord): Promise<void>;
};
export declare type SpecRecord = {
    refs: SpecReference[];
    actions: SpecAction[];
};
export declare type SpecReference = {
    /**
     * Name of the plugin
     */
    plugin: string;
    /**
     * `target` is the spy or stub of the subject.
     */
    target: any;
    ref: string;
};
export declare type SpecReferenceRecord = SpecReferenceBase & {
    plugin: string;
    value?: any;
};
export declare type SpecReferenceBase = {
    subjectId?: number;
    instanceId?: number;
    invokeId?: number;
};
/**
 * Meta data of the action.
 * Save information about the action during spying,
 * so that it can be used during stubbing to replay the behavior.
 */
export declare type Meta = Record<string, any>;
export declare type SpecAction = ConstructAction | InvokeAction | GetAction | SetAction | ReturnAction | ThrowAction;
export declare type ConstructAction = {
    type: 'construct';
    payload: any[] | undefined;
    ref: string;
};
export declare type InvokeAction = {
    type: 'invoke';
    payload: any[] | undefined;
    ref: string;
};
export declare type ReturnAction = {
    type: 'return';
    payload: any;
    ref: string;
};
export declare type ThrowAction = {
    type: 'throw';
    payload: any;
    ref: string;
};
export declare type GetAction = {
    type: 'get';
    payload: string | number;
    ref: string;
};
export declare type SetAction = {
    type: 'set';
    payload: [string | number, any];
    ref: string;
};
//# sourceMappingURL=types.d.ts.map