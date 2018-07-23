export declare type PluginActivationContext = {
    register(name: string, support: (subject: any) => boolean, getSpy: (context: any, subject: any) => any, getStub: (context: any, subject: any) => any, serialize: (subject: any) => string): void;
};
export interface Plugin<T extends object = {}> {
    /**
     * Type of the plugin.
     * This is used to uniquely identify the plugin.
     */
    type: string;
    support: (subject: any) => boolean;
    getSpy: any;
    getStub: any;
    serialize?: (subject: T) => string;
}
export declare type PluginModule = {
    activate: (activationContext: PluginActivationContext) => void;
};
//# sourceMappingURL=interfaces.d.ts.map