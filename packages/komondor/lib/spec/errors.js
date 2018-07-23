"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_error_1 = require("make-error");
const tersify_1 = require("tersify");
class IDCannotBeEmpty extends make_error_1.BaseError {
    // istanbul ignore next
    constructor() {
        super(`The spec id cannot be an empty string. It should uniquely identify the spec.`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.IDCannotBeEmpty = IDCannotBeEmpty;
class NotSpecable extends make_error_1.BaseError {
    // istanbul ignore next
    constructor(subject) {
        super(`The ${typeof subject === 'string' ? subject : `subject ${tersify_1.tersify(subject, { maxLength: 50 })}`} is not supported by any loaded plugins`);
        this.subject = subject;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.NotSpecable = NotSpecable;
class SimulationMismatch extends make_error_1.BaseError {
    // istanbul ignore next
    constructor(specId, expected, actual) {
        super(`Recorded data for '${specId}' doesn't match with simulation. Expecting ${tersify_1.tersify(expected, { maxLength: Infinity })} but received ${tersify_1.tersify(actual, { maxLength: Infinity })}`);
        this.specId = specId;
        this.expected = expected;
        this.actual = actual;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.SimulationMismatch = SimulationMismatch;
class MissingArtifact extends make_error_1.BaseError {
    // istanbul ignore next
    constructor(id) {
        super(`Missing artifact: ${id}`);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
exports.MissingArtifact = MissingArtifact;
//# sourceMappingURL=errors.js.map