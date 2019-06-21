import { ValidatingRecord } from './createValidatingRecord';
import { SpecOptions, SpecAction } from './types';

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
          const ref = record.getRef(action.ref)
          if (ref.specTarget) return
          const args = action.payload.map(a => record.getSubject(a))
          ref.target(...args)
      }
    }
  }
}
