import { CircularTracker } from './createSaveSpec';
import { stubContext } from './createSimulateSpec';
import { ValidateRecord } from './createValidateRecord';
import { getPlugin } from './findPlugin';
import { logAutoInvokeAction, logCreateStub } from './logs';
import { InstantiateAction, InvokeAction, SpecOptions, SpecReference } from './types';

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
        case 'instantiate':
          processInstantiate(record, expectedAction)
          break
        // case 'get':
        //   processGet(record, expectedAction)
        //   break
      }
    }
  }
}

function processInvoke(record: ValidateRecord, expectedAction: InvokeAction) {
  if (expectedAction.mode === 'passive') return

  // TODO: this is likely not needed because invokeAction.ref can only be ReferenceId,
  // if we don't support getter/setter.
  const id = record.resolveRefId(expectedAction.ref)
  if (!id) return

  if (expectedAction.mode === 'plugin-invoked') {
    const origRef = record.getOriginalRef(id)!
    const plugin = getPlugin(origRef.plugin)
    const tracker: CircularTracker = {}
    const ref: SpecReference = { plugin: plugin.name, subject: undefined, source: { ref: expectedAction.ref, site: undefined }, mode: 'plugin-invoked' }
    record.addRef(ref)
    logCreateStub({ plugin: plugin.name, id: id })

    const context = stubContext({ record, plugin, ref, id, tracker })
    ref.testDouble = plugin.createStub(context, undefined, origRef.meta)
    if (tracker.site && tracker.site.length > 0) {
      const site = tracker.site.pop()!
      tracker.site.reduce((p, v) => p[v], ref.testDouble)[site] = ref.testDouble
    }
    return
  }
  const ref = record.getRef(id)
  if (!ref) {
    throw new Error(`simulator.processInvoke can't find reference for ${id}`)
  }

  // console.log('exp', expectedAction, ref)
  // console.log('expectedAction', expectedAction, record.actual)
  const args = expectedAction.payload.map(a => {
    if (typeof a !== 'string') return a

    const reference = record.getRef(a)
    if (reference) return reference.testDouble

    const origRef = record.getOriginalRef(a)
    if (!origRef) {
      throw new Error(`Can't find reference of ${a}`)
    }

    if (!origRef.source) {
      throw new Error(`no source found for ${a}`)
    }

    const plugin = getPlugin(origRef.plugin)
    const tracker: CircularTracker = {}
    const ref: SpecReference = { plugin: plugin.name, subject: undefined, source: { ref: expectedAction.ref, site: undefined }, mode: 'plugin-invoked' }
    record.addRef(ref)
    logCreateStub({ plugin: plugin.name, id })

    const context = stubContext({ record, plugin, ref, id, tracker })
    ref.testDouble = plugin.createStub(context, undefined, origRef.meta)
    if (tracker.site && tracker.site.length > 0) {
      const site = tracker.site.pop()!
      tracker.site.reduce((p, v) => p[v], ref.testDouble)[site] = ref.testDouble
    }
    return ref.testDouble
  })

  logAutoInvokeAction(ref, id, record.getExpectedActionId(), args)
  // console.log('before auto', record.original)
  // console.log('before auto', record.actual)
  const invokeSubject = getInvokeSubject(ref.testDouble, expectedAction.site)
  invokeSubject(...args)
}

function getInvokeSubject(subject: any, site: Array<string | number> | undefined) {
  if (!site || site.length === 0) return subject
  const methodName = site.pop()!

  const target = site.reduce((p, v) => p[v], subject)
  return target[methodName].bind(target)
}

function processInstantiate(record: ValidateRecord, expectedAction: InstantiateAction) {
  if (expectedAction.mode === 'passive') return

  const classReference = record.getRef(expectedAction.ref)!
  // TODO: get spy/stub from payload
  return new classReference.testDouble(...expectedAction.payload)
}

// function processGet(record: ValidateRecord, action: GetAction) {
//   const refId = record.resolveRefId(action.ref)
//   const ref = record.resolveRef(action.ref)
//   if (ref.specTarget) return
//   const name = record.getSubject(action.payload)
//   logAutoGetAction(ref, refId, record.peekActionId(), name)
//   return ref.target[name]
// }
