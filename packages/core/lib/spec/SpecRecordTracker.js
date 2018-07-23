"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SpecRecordTracker = /** @class */ (function () {
    function SpecRecordTracker(record) {
        this.record = record;
    }
    SpecRecordTracker.prototype.addReference = function (ref) {
        this.record.refs.push(ref);
    };
    SpecRecordTracker.prototype.addAction = function (action) {
        this.record.actions.push(action);
    };
    return SpecRecordTracker;
}());
exports.SpecRecordTracker = SpecRecordTracker;
//# sourceMappingURL=SpecRecordTracker.js.map