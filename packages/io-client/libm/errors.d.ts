import { BaseError } from 'make-error';
export declare class ServerNotAvailable extends BaseError {
    url: string;
    constructor(url: string);
}
export declare class ServerNotAvailableAtPortRange extends BaseError {
    url: string;
    constructor(url: string, start: number, end: number);
}
//# sourceMappingURL=errors.d.ts.map