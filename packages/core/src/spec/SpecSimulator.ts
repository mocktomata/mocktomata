import { ValidatingRecord } from './createValidatingRecord';
import { SpecOptions, SpecAction, InvokeAction, GetAction } from './types';

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
    process() {
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
  if (ref.specTarget) return
  const args = action.payload.map(a => record.getSubject(a))
  ref.target(...args)
}

function processGet(record: ValidatingRecord, action: GetAction) {
  const ref = record.getRef(action.ref)
  if (ref.specTarget) return
  const name = record.getSubject(action.payload)
  return ref.target[name]
}
