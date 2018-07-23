export class SpecRecordTracker {
    constructor(record) {
        this.record = record;
    }
    addReference(ref) {
        this.record.refs.push(ref);
    }
    addAction(action) {
        this.record.actions.push(action);
    }
}
//# sourceMappingURL=SpecRecordTracker.js.map