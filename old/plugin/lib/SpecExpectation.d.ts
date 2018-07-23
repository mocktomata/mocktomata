export declare function createExpectation(type: string, name: string, baseMeta?: {
    [k: string]: any;
}): (payload?: any, meta?: {
    [k: string]: any;
} | undefined) => {
    type: string;
    name: string;
    payload: any;
    meta?: undefined;
} | {
    type: string;
    name: string;
    payload: any;
    meta: {};
};
export declare function createScopedCreateExpectation(scope: string): (subType: string, name: string, baseMeta?: {
    [k: string]: any;
} | undefined) => (payload?: any, meta?: {
    [k: string]: any;
} | undefined) => {
    type: string;
    name: string;
    payload: any;
    meta?: undefined;
} | {
    type: string;
    name: string;
    payload: any;
    meta: {};
};
//# sourceMappingURL=SpecExpectation.d.ts.map