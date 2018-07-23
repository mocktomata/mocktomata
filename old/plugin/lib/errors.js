"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const make_error_1 = require("make-error");
const tersify_1 = require("tersify");
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
//# sourceMappingURL=errors.js.map