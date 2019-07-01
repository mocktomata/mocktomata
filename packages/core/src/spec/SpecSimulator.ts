import { ValidatingRecord } from './createValidatingRecord';
import { GetAction, InvokeAction, SpecOptions } from './types';
import { log } from '../util';
import { tersify } from 'tersify';

export function createSpecSimulator(record: ValidatingRecord, options: SpecOptions) {
  // use `options` to control which simulator to use.
  // currently only one.
  return createSpecImmediateSimulator(record)
}

/**
 * Create a simulator that will instantly perform actions,
 * ignoring action.tick.
 */
function createSpecImmediateSimulator(record: ValidatingRecord) {
  return {
    run() {
      const action = record.peekAction()
      if (!action) return
      switch (action.type) {
        case 'invoke':
          processInvoke(record, action)
          break
        case 'get':
          processGet(record, action)
          break
      }
    }
  }
}

function processInvoke(record: ValidatingRecord, action: InvokeAction) {
  const ref = record.getRef(action.ref)
  if (!ref) {
    record.resolveRef(action.ref)
    return
  }
  if (ref.specTarget) return
  const args = action.payload.map(a => record.getSubject(a))
  log.onDebug(log => log(`${ref.plugin} auto invoke ${tersify(args)} on:\n`, tersify(ref.subject)))
  ref.target(...args)
}

function processGet(record: ValidatingRecord, action: GetAction) {
  const ref = record.resolveRef(action.ref)
  if (ref.specTarget) return
  const name = record.getSubject(action.payload)
  log.onDebug(log => log(`${ref.plugin} auto get ${name} on:\n`, tersify(ref.subject)))
  return ref.target[name]
}
