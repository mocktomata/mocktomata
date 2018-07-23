import { getSpy, getStub } from './interfaces';
export interface Registrar {
    /**
     * Register a type handler.
     * @param type The action type handled by the plugin
     * @param support A predicate function to determine can the plugin support the specified subject
     */
    register<T = any>(type: string, support: (subject: any) => boolean, getSpy: getSpy<T>, getStub: getStub<T>, 
    /**
     * If the subject can be used as input of output,
     * and it does not serialize well (e.g. Stream),
     * define this method to serialize the subject,
     * so that the serialized object is sufficient to pass the `support()` predicate.
     */
    serialize?: (subject: any) => any): void;
}
export interface Plugin<T> {
    type: string;
    support: (subject: any) => boolean;
    getSpy: getSpy<T>;
    getStub: getStub<T>;
    serialize?: (subject: any) => any;
}
//# sourceMappingURL=Registrar.d.ts.map