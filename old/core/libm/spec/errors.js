import { BaseError } from 'make-error';
import { tersify } from 'tersify';
export class SpecNotFound extends BaseError {
    // istanbul ignore next
    constructor(specId, reason) {
        super(`Unable to find the spec record for '${specId}'${reason ? `due to: ${reason}` : ''}`);
        this.specId = specId;
        this.reason = reason;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class IDCannotBeEmpty extends BaseError {
    // istanbul ignore next
    constructor() {
        super(`The spec id cannot be an empty string. It should uniquely identify the spec.`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class NotSpecable extends BaseError {
    // istanbul ignore next
    constructor(subject) {
        super(`The ${typeof subject === 'string' ? subject : `subject ${tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`);
        this.subject = subject;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class SimulationMismatch extends BaseError {
    // istanbul ignore next
    constructor(specId, expected, actual) {
        super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify(expected, { maxLength: Infinity })} but received ${tersify(actual, { maxLength: Infinity })}`);
        this.specId = specId;
        this.expected = expected;
        this.actual = actual;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class MissingArtifact extends BaseError {
    // istanbul ignore next
    constructor(id) {
        super(`Missing artifact: ${id}`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=errors.js.map