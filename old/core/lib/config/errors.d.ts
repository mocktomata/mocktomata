import { BaseError } from 'make-error';
export declare class InvalidConfigFormat extends BaseError {
    filename: string;
    constructor(filename: string);
}
export declare class AmbiguousConfig extends BaseError {
    configs: string[];
    constructor(configs: string[]);
}
export declare class MissingConfigForFeature extends BaseError {
    feature: string;
    configPath: string;
    constructor(feature: string, configPath: string);
}
export declare class ConfigPropertyIsInvalid extends BaseError {
    property: string;
    cause: string;
    constructor(property: string, cause: string);
}
export declare class ConfigPropertyNotRecognized extends BaseError {
    property: string;
    constructor(property: string);
}
//# sourceMappingURL=errors.d.ts.map