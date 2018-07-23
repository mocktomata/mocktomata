export declare const simpleCallback: {
    increment(callback: (x: number, callback: (err: any, resposne: number) => void) => void, x: number): Promise<number>;
    success(a: number, callback: (err: any, response: number) => void): void;
    fail(a: number, callback: (err: any, response: null) => void): void;
};
//# sourceMappingURL=testSuite.d.ts.map