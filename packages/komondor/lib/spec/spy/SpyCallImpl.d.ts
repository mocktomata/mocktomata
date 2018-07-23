import { SpyCall } from './interfaces';
import { SpyInstanceImpl } from './SpyInstanceImpl';
export declare class SpyCallImpl implements SpyCall {
    instance: SpyInstanceImpl;
    invokeId: number;
    callMeta?: {
        [k: string]: any;
    } | undefined;
    constructor(instance: SpyInstanceImpl, invokeId: number, callMeta?: {
        [k: string]: any;
    } | undefined);
    invoke<T extends any[]>(args: T, meta?: {
        [k: string]: any;
    }): T;
    return<T>(result: T, meta?: {
        [k: string]: any;
    }): T;
    throw<T>(err: T, meta?: {
        [k: string]: any;
    }): T;
}
//# sourceMappingURL=SpyCallImpl.d.ts.map