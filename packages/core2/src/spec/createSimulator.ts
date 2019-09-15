import { createStubContext, StubContextInternal } from './createSimulateSpec';
import { getPlugin } from './findPlugin';
import { logAutoInvokeAction } from './logs';
import { InvokeAction, SpecOptions } from './types';

export function createSimulator(context: StubContextInternal, _options: SpecOptions) {
  // use `options` to control which simulator to use.
  // currently only one.
  return createSpecImmediateSimulator(context)
}

/**
 * Create a simulator that will instantly perform actions,
 * ignoring action.tick.
 */
function createSpecImmediateSimulator({ record, contextTracker }: StubContextInternal) {
  return {
    run() {
      const expectedAction = record.getExpectedAction()
      if (!expectedAction) return
      switch (expectedAction.type) {
        case 'invoke':
          processInvoke({ record, contextTracker }, expectedAction)
          break
        // case 'get':
        //   processGet(record, expectedAction)
        //   break
      }
    }
  }
}

function processInvoke({ record, contextTracker }: StubContextInternal, expectedAction: InvokeAction) {
  if (expectedAction.mode !== 'autonomous') return

  const refId = record.resolveRefId(expectedAction.ref)
  if (!refId) return
  const ref = record.getRef(refId)!
  // console.log('expectedAction', expectedAction, record.actual)
  const args = expectedAction.payload.map(a => {
    if (typeof a !== 'string') return a
    const origRef = record.getOriginalRef(a)
    const plugin = getPlugin(origRef!.plugin)
    const context = createStubContext({ record, contextTracker }, plugin.name, refId)
    return plugin.createStub(context, origRef!.meta)
  })
  logAutoInvokeAction(ref, refId, record.getExpectedActionId(), args)
  // console.log('before auto', record.original)
  // console.log('before auto', record.actual)
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
