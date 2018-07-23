import { getPlugin } from '../plugin';
import { SimulationMismatch } from './errors';
import { isMismatchAction } from './isMismatchAction';
export function createSpecRecordTracker(record) {
    return {
        getReference(plugin, target) {
            const ref = this.findReference(target) || String(record.refs.length + 1);
            record.refs.push({ ref, plugin, target });
            return ref;
        },
        findReference(target) {
            const specRef = record.refs.find(ref => ref.target === target);
            if (specRef)
                return specRef.ref;
            return undefined;
        },
        invoke(ref, args) {
            record.actions.push({
                type: 'invoke',
                ref,
                payload: args.map(arg => this.findReference(arg) || arg)
            });
        },
        return(ref, result) {
            const payload = this.findReference(result) || result;
            record.actions.push({
                type: 'return',
                ref,
                payload
            });
        },
        throw(ref, err) {
            const payload = this.findReference(err) || err;
            record.actions.push({
                type: 'throw',
                ref,
                payload
            });
        },
        addAction(action) {
            record.actions.push(action);
        }
    };
}
export function createSpecRecordValidator(id, loaded, record) {
    return {
        getReference(plugin, target) {
            const ref = this.findReference(target) || String(record.refs.length + 1);
            record.refs.push({ ref, plugin, target });
            return ref;
        },
        findReference(target) {
            const specRef = record.refs.find(ref => ref.target === target);
            if (specRef)
                return specRef.ref;
            return undefined;
        },
        resolveTarget(ref) {
            let specRef = record.refs.find(r => r.ref === ref);
            if (specRef)
                return specRef.target;
            specRef = loaded.refs.find(r => r.ref === ref);
            if (specRef) {
                const plugin = getPlugin(specRef.plugin);
                if (plugin && plugin.deserialize) {
                    return plugin.deserialize(specRef.target);
                }
                else {
                    return specRef.target;
                }
            }
            return undefined;
        },
        invoke(ref, args) {
            const action = {
                type: 'invoke',
                ref,
                payload: args.map(arg => this.findReference(arg) || arg)
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        return(ref, result) {
            const payload = this.findReference(result) || result;
            const action = {
                type: 'return',
                ref,
                payload
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        throw(ref, err) {
            const payload = this.findReference(err) || err;
            const action = {
                type: 'throw',
                ref,
                payload
            };
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        addAction(action) {
            validateAction(id, loaded, record, action);
            record.actions.push(action);
        },
        succeed() {
            const next = loaded.actions[record.actions.length];
            return next.type === 'return';
        },
        result() {
            const next = loaded.actions[record.actions.length];
            return this.resolveTarget(next.payload) || next.payload;
        }
    };
}
function validateAction(id, actualRecord, record, action) {
    const expected = actualRecord.actions[record.actions.length];
    if (isMismatchAction(action, expected)) {
        throw new SimulationMismatch(id, expected, action);
    }
}
//# sourceMappingURL=SpecRecord.js.map