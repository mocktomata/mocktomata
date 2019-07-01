import { ValidatingRecord } from './createValidatingRecord';
import { logAutoGetAction, logAutoInvokeAction } from './log';
import { GetAction, InvokeAction, SpecOptions } from './types';

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
  const refId = record.resolveRefId(action.ref)
  const ref = record.getRef(action.ref)
  if (!ref) {
    record.resolveRef(action.ref)
    return
  }
  if (ref.specTarget) return
  const args = action.payload.map(a => record.getSubject(a))
  logAutoInvokeAction(ref, refId, record.peekActionId(), args)
  ref.target(...args)
}

function processGet(record: ValidatingRecord, action: GetAction) {
  const refId = record.resolveRefId(action.ref)
  const ref = record.resolveRef(action.ref)
  if (ref.specTarget) return
  const name = record.getSubject(action.payload)
  logAutoGetAction(ref, refId, record.peekActionId(), name)
  return ref.target[name]
}
