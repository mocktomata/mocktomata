import { ValidateRecord } from './createValidateRecord';
import { logAutoInvokeAction } from './logs';
import { InvokeAction, SpecOptions } from './types';

export function createSimulator(record: ValidateRecord, _options: SpecOptions) {
  // use `options` to control which simulator to use.
  // currently only one.
  return createSpecImmediateSimulator(record)
}

/**
 * Create a simulator that will instantly perform actions,
 * ignoring action.tick.
 */
function createSpecImmediateSimulator(record: ValidateRecord) {
  return {
    run() {
      const expectedAction = record.getExpectedAction()
      if (!expectedAction) return
      switch (expectedAction.type) {
        case 'invoke':
          processInvoke(record, expectedAction)
          break
        // case 'get':
        //   processGet(record, expectedAction)
        //   break
      }
    }
  }
}

function processInvoke(record: ValidateRecord, expectedAction: InvokeAction) {
  if (expectedAction.mode !== 'autonomous') return

  const refId = record.resolveRefId(expectedAction.ref)
  if (!refId) return
  const ref = record.getRef(refId)
  const args = expectedAction.payload.map(a => record.getSubject(a))
  logAutoInvokeAction(ref, refId, record.getExpectedActionId(), args)
  ref.testDouble(...args)
}

// function processGet(record: ValidateRecord, action: GetAction) {
//   const refId = record.resolveRefId(action.ref)
//   const ref = record.resolveRef(action.ref)
//   if (ref.specTarget) return
//   const name = record.getSubject(action.payload)
//   logAutoGetAction(ref, refId, record.peekActionId(), name)
//   return ref.target[name]
// }
