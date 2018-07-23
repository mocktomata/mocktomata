import { BaseError } from 'make-error';
export class InvalidConfigFormat extends BaseError {
    // istanbul ignore next
    constructor(filename) {
        super(`The ${filename} does not contain a valid configuration`);
        this.filename = filename;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class AmbiguousConfig extends BaseError {
    // istanbul ignore next
    constructor(configs) {
        super(`Multiple configuration detected (${configs.join(', ')}). Please consolidate to one config.`);
        this.configs = configs;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class MissingConfigForFeature extends BaseError {
    // istanbul ignore next
    constructor(feature, configPath) {
        super(`Configuring ${configPath} is required to use ${feature}.`);
        this.feature = feature;
        this.configPath = configPath;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ConfigPropertyIsInvalid extends BaseError {
    // istanbul ignore next
    constructor(property, cause) {
        super(`The property '${property}' is invalid: ${cause}`);
        this.property = property;
        this.cause = cause;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class ConfigPropertyNotRecognized extends BaseError {
    // istanbul ignore next
    constructor(property) {
        super(`The property '${property}' is not a valid komondor option.`);
        this.property = property;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map