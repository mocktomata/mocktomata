import { Meta } from '../interfaces';
export declare type SpyContext = {
    newInstance(options: {
        args?: any[];
        meta?: Meta;
    }): SpyInstance;
};
export declare type SpyInstance = {
    /**
     * Id of the spy instance.
     * For functions, each subject (different function) should have its own id.
     * For class, each instance (when instantiating a class) should have its own id.
     */
    instanceId: number;
    /**
     * Create a new call context for recording the call.
     */
    newCall(meta?: Meta): SpyCall;
};
export declare type SpyCall = {
    invokeId: number;
    /**
     * Record that the call is being invoked
     * @param args the args that the call is invoked with
     */
    invoke<T extends any[]>(args: T, meta?: Meta): T;
    /**
     * Record that the call is returning
     * @param result the return result
     */
    return<T>(result: T, meta?: Meta): T;
    /**
     * Record that the call is throwing
     * @param err the error to be thrown.
     */
    throw<T>(err: T, meta?: Meta): T;
};
//# sourceMappingURL=interfaces.d.ts.map