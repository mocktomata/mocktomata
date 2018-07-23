import { Meta } from './interfaces';
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
export declare function isMismatchAction(actual: Partial<SpecAction>, expected: Partial<SpecAction>): boolean;
export declare function makeSerializableActions(actions: SpecAction[]): Pick<SpecAction, "payload">[];
export declare function makeSerializableAction(action: Pick<SpecAction, 'payload'>): Pick<SpecAction, "payload">;
//# sourceMappingURL=specAction.d.ts.map