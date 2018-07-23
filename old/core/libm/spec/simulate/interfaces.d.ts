import { Meta } from '../interfaces';
export declare type StubContext = {
    newInstance(options: {
        args?: any[];
        meta?: Meta;
    }): StubInstance;
};
export declare type StubInstance = {
    /**
     * Create a new call context for replaying the call.
     */
    newCall(meta?: Meta): StubCall;
};
export interface StubCall {
    /**
     * The call in being invoked.
     */
    invoked(args: any[], meta?: Meta): void;
    /**
     * Wait for the call to return.
     * TODO: convert waitUnitlReturn to Promise based
     * @param callback callback to be invoked when the call is returned.
     */
    waitUntilReturn(callback: any): void;
    /**
     * Check whether the call is successful or result in an error.
     * @param meta specific meta to compare
     */
    succeed(meta?: Meta): boolean;
    /**
     * Get the result of the call.
     */
    result(): any;
    /**
     * Get the thrown error of the call.
     * TODO: may not needed and just use result?
     */
    thrown(): any;
}
//# sourceMappingURL=interfaces.d.ts.map