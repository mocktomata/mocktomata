export declare const spec: (<T>(id: string, subject: T, options?: {
    timeout: number;
}) => Promise<import("./interfaces").Spec<T>>) & {
    live: <T>(id: string, subject: T, options?: {
        timeout: number;
    }) => Promise<import("./interfaces").Spec<T>>;
    save: <T>(id: string, subject: T, options?: {
        timeout: number;
    }) => Promise<import("./interfaces").Spec<T>>;
    simulate: <T>(id: string, subject: T, options?: {
        timeout: number;
    }) => Promise<import("./interfaces").Spec<T>>;
};
//# sourceMappingURL=spec.d.ts.map