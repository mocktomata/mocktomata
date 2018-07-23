export declare class Dummy {
    do(): void;
}
export declare const simpleCallback: {
    increment(remote: Function, value: number): Promise<number>;
    success(value: number, callback: (err: any, result: number) => void): void;
    fail(value: number, callback: (err: any, result?: number | undefined) => void): void;
};
export declare const fetch: {
    add(fetch: Function, x: number, y: number): Promise<{}>;
    success(_url: string, options: {
        x: number;
        y: number;
    }, callback: Function): void;
    fail(_url: string, _options: {
        x: number;
        y: number;
    }, callback: Function): void;
};
export declare const literalCallback: {
    increment(remote: Function, x: number): Promise<{}>;
    success(options: {
        data: number;
        success: Function;
    }): void;
    fail(options: {
        data: number;
        success: Function;
        error: Function;
    }): void;
};
export declare const synchronous: {
    increment(remote: Function, x: number): any;
    success(_url: string, x: number): number;
    fail(): never;
};
export declare const delayed: {
    increment(remote: Function, x: number): Promise<{}>;
    success(a: number, callback: Function): void;
};
export declare const recursive: {
    decrementToZero(remote: Function, x: number): Promise<{}>;
    success(a: number, callback: Function): void;
};
export declare const postReturn: {
    fireEvent(name: string, times: number, callback: Function): void;
};
//# sourceMappingURL=testSubjects.d.ts.map